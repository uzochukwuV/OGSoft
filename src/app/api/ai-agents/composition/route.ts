import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { users } from '@/lib/db/schema';
import { aiAgents, aiAgentCompositions } from '@/lib/db/schema-ai';
import { eq } from 'drizzle-orm';

// POST /api/ai-agents/composition - Create a new AI agent composition
export async function POST(request: NextRequest) {
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
    
    // Parse the request body
    const body = await request.json();
    const { title, description, composition } = body;
    
    // Validate the request
    if (!title || !description || !composition || !Array.isArray(composition) || composition.length < 2) {
      return NextResponse.json(
        { error: 'Invalid request. Title, description, and at least two agents in composition are required.' },
        { status: 400 }
      );
    }
    
    // Validate that all agents in the composition exist and the user is authorized to use them
    for (const item of composition) {
      const { agentId } = item;
      
      // Check if the agent exists
      const agent = await db.query.aiAgents.findFirst({
        where: eq(aiAgents.id, agentId),
      });
      
      if (!agent) {
        return NextResponse.json(
          { error: `Agent with ID ${agentId} not found` },
          { status: 404 }
        );
      }
      
      // If the user is not the creator, check if they are authorized
      if (agent.creatorId !== user.id) {
        const isAuthorized = await db.query.aiAgentAuthorizations.findFirst({
          where: eq(aiAgentAuthorizations.agentId, agentId),
          where: eq(aiAgentAuthorizations.userId, user.id),
        });
        
        if (!isAuthorized) {
          return NextResponse.json(
            { error: `You are not authorized to use agent with ID ${agentId}` },
            { status: 403 }
          );
        }
      }
    }
    
    // Create a new AI agent for the composition
    const [newAgent] = await db.insert(aiAgents).values({
      title,
      description,
      type: 'composition',
      creatorId: user.id,
      price: 0, // Compositions are not directly purchasable
      status: 'active',
      isPublic: false, // Compositions are private by default
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning({ id: aiAgents.id });
    
    if (!newAgent) {
      throw new Error('Failed to create agent composition');
    }
    
    // Create the composition relationships
    for (const item of composition) {
      await db.insert(aiAgentCompositions).values({
        compositionId: newAgent.id,
        componentId: item.agentId,
        role: item.role,
        order: item.order,
        createdAt: new Date(),
      });
    }
    
    return NextResponse.json({
      id: newAgent.id,
      title,
      description,
      message: 'AI agent composition created successfully',
    });
  } catch (error) {
    console.error('Error creating agent composition:', error);
    return NextResponse.json(
      { error: 'Failed to create agent composition' },
      { status: 500 }
    );
  }
}

// GET /api/ai-agents/composition - Get all compositions for the current user
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
    
    // Get all compositions created by this user
    const compositions = await db.query.aiAgents.findMany({
      where: eq(aiAgents.creatorId, user.id),
      where: eq(aiAgents.type, 'composition'),
      with: {
        components: {
          with: {
            component: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      compositions: compositions.map(comp => ({
        id: comp.id,
        title: comp.title,
        description: comp.description,
        components: comp.components.map(c => ({
          id: c.componentId,
          role: c.role,
          order: c.order,
        })),
      })),
    });
  } catch (error) {
    console.error('Error fetching compositions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compositions' },
      { status: 500 }
    );
  }
}