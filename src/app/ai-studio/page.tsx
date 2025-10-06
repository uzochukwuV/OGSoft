import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIAgentComposer } from '@/components/AIAgentComposer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { aiAgentAuthorizations } from '@/lib/db/schema-ai';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const metadata: Metadata = {
  title: 'AI Studio | 0G Marketplace',
  description: 'Create, compose, and interact with AI agents on the 0G network',
};

export default async function AIStudioPage() {
  const session = await getServerSession(authOptions);
  let authorizedAgentCount = 0;
  
  if (session?.user?.email) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    
    if (user) {
      const authorizations = await db.query.aiAgentAuthorizations.findMany({
        where: eq(aiAgentAuthorizations.userId, user.id),
      });
      
      authorizedAgentCount = authorizations.length;
    }
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">AI Studio</h1>
      <p className="text-muted-foreground mb-8">
        Create, compose, and interact with AI agents on the 0G network
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Create AI Agent</CardTitle>
            <CardDescription>
              Create your own AI agent as an INFT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/publish/ai-agent">Create Agent</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Browse Marketplace</CardTitle>
            <CardDescription>
              Discover and purchase AI agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/ai-marketplace">Browse Agents</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>My AI Agents</CardTitle>
            <CardDescription>
              {authorizedAgentCount > 0 
                ? `You have access to ${authorizedAgentCount} AI agents` 
                : 'You don\'t have any AI agents yet'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/ai-studio/my-agents">View My Agents</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compose">Compose Agents</TabsTrigger>
          <TabsTrigger value="interact">Interact</TabsTrigger>
        </TabsList>
        <TabsContent value="compose" className="mt-6">
          <AIAgentComposer />
        </TabsContent>
        <TabsContent value="interact" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Agent Interaction</CardTitle>
              <CardDescription>
                Select an AI agent to start a conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Select an AI agent from your collection to start interacting
                </p>
                <Button asChild>
                  <Link href="/ai-studio/my-agents">View My Agents</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}