import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { aiAgents, aiAgentAuthorizations, aiAgentMetadata } from '@/lib/db/schema-ai';
import { eq, and } from 'drizzle-orm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My AI Agents | 0G Marketplace',
  description: 'View and interact with your authorized AI agents',
};

export default async function MyAgentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/login?callbackUrl=/ai-studio/my-agents');
  }
  
  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });
  
  if (!user) {
    redirect('/login?callbackUrl=/ai-studio/my-agents');
  }
  
  // Get all authorized agents for this user
  const authorizations = await db.query.aiAgentAuthorizations.findMany({
    where: eq(aiAgentAuthorizations.userId, user.id),
    with: {
      agent: {
        with: {
          metadata: true,
          creator: true,
        },
      },
    },
  });
  
  // Get agents created by this user
  const createdAgents = await db.query.aiAgents.findMany({
    where: eq(aiAgents.creatorId, user.id),
    with: {
      metadata: true,
    },
  });
  
  // Combine and deduplicate
  const authorizedAgents = authorizations.map(auth => auth.agent);
  const allAgents = [...authorizedAgents];
  
  // Add created agents that aren't already in the authorized list
  for (const agent of createdAgents) {
    if (!allAgents.some(a => a.id === agent.id)) {
      allAgents.push(agent);
    }
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My AI Agents</h1>
          <p className="text-muted-foreground mt-1">
            View and interact with your authorized AI agents
          </p>
        </div>
        <Button asChild>
          <Link href="/ai-studio">Back to AI Studio</Link>
        </Button>
      </div>
      
      {allAgents.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No AI Agents Found</CardTitle>
            <CardDescription>
              You don't have any authorized AI agents yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-4">
              Visit the AI Marketplace to discover and purchase AI agents
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/ai-marketplace">Browse AI Marketplace</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allAgents.map((agent) => (
            <Card key={agent.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{agent.title}</CardTitle>
                  <Badge variant="outline">{agent.type}</Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {agent.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Base Model:</span>
                    <p>{agent.metadata?.baseModel || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Capabilities:</span>
                    <p className="line-clamp-2">{agent.metadata?.capabilities || 'Not specified'}</p>
                  </div>
                  {agent.creatorId === user.id && (
                    <Badge className="mt-2" variant="secondary">Created by you</Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/ai-marketplace/${agent.id}`}>View & Interact</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}