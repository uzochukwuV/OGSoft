import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { users } from '@/lib/db/schema';
import { aiAgents, aiAgentAuthorizations } from '@/lib/db/schema-ai';
import { eq, and } from 'drizzle-orm';

// GET /api/ai-agents/authorized - Get all AI agents authorized for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the user from the database
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get all authorized agents for this user
    const authorizations = await db.query.aiAgentAuthorizations.findMany({
      where: eq(aiAgentAuthorizations.userId, user.id),
      with: {
        agent: true,
      },
    });
    
    // Get agents created by this user
    const createdAgents = await db.query.aiAgents.findMany({
      where: eq(aiAgents.creatorId, user.id),
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
    
    return NextResponse.json({
      agents: allAgents.map(agent => ({
        id: agent.id,
        title: agent.title,
        type: agent.type,
        description: agent.description,
      })),
    });
  } catch (error) {
    console.error('Error fetching authorized agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch authorized agents' },
      { status: 500 }
    );
  }
}