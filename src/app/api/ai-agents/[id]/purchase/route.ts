import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AIAgentService } from '@/lib/0g/ai-agent-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { users } from '@/lib/db/schema';
import { transactions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Environment variables for INFT contract
const INFT_CONTRACT_ADDRESS = process.env.INFT_CONTRACT_ADDRESS || '';

// Initialize the AI agent service
const aiAgentService = new AIAgentService(INFT_CONTRACT_ADDRESS);

// POST /api/ai-agents/[id]/purchase - Purchase an AI agent
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    // Get the agent ID from the URL
    const agentId = parseInt(params.id);
    
    if (isNaN(agentId)) {
      return NextResponse.json(
        { error: 'Invalid agent ID' },
        { status: 400 }
      );
    }
    
    // Get the agent with metadata
    const agent = await aiAgentService.getAIAgentWithMetadata(agentId);
    
    if (!agent) {
      return NextResponse.json(
        { error: 'AI agent not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is already authorized to use this agent
    const isAuthorized = await aiAgentService.isUserAuthorized(agentId, user.id);
    
    if (isAuthorized) {
      return NextResponse.json(
        { message: 'Already authorized to use this agent' },
        { status: 200 }
      );
    }
    
    // Process the payment (in a real app, this would involve blockchain transactions)
    // For now, we'll just authorize the user and create a transaction record
    
    // Create a transaction record
    await db.insert(transactions).values({
      buyerId: user.id,
      sellerId: agent.creatorId,
      contentId: null, // Not an artwork
      agentId: agent.id, // This is an AI agent
      price: agent.price,
      status: 'completed',
      transactionHash: 'simulated-' + Date.now().toString(16), // Simulated transaction hash
      createdAt: new Date(),
    });
    
    // Authorize the user to use the agent
    await aiAgentService.authorizeUser(agentId, user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Successfully purchased AI agent',
    });
  } catch (error) {
    console.error('Error purchasing AI agent:', error);
    return NextResponse.json(
      { error: 'Failed to purchase AI agent' },
      { status: 500 }
    );
  }
}