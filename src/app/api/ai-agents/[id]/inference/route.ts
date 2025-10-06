import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AIAgentService } from '@/lib/0g/ai-agent-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { users } from '@/lib/db/schema';
import { aiAgentInferenceLogs } from '@/lib/db/schema-ai';
import { eq } from 'drizzle-orm';

// Environment variables for INFT contract
const INFT_CONTRACT_ADDRESS = process.env.INFT_CONTRACT_ADDRESS || '';

// Initialize the AI agent service
const aiAgentService = new AIAgentService(INFT_CONTRACT_ADDRESS);

// POST /api/ai-agents/[id]/inference - Execute inference with an AI agent
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
    
    // Check if the user is authorized to use this agent
    const isAuthorized = await aiAgentService.isUserAuthorized(agentId, user.id);
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Not authorized to use this AI agent' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Validate the request body
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
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
    
    // Initialize the 0G Compute SDK
    const { default: useAIInference } = await import('@/hooks/useAIInference');
    const { executeInference } = useAIInference();
    
    // Execute inference
    const result = await executeInference(agent.inftContractAddress!, body.messages);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Inference failed' },
        { status: 500 }
      );
    }
    
    // Increment the usage count
    await aiAgentService.incrementUsageCount(agentId, user.id);
    
    // Log the inference
    await db.insert(aiAgentInferenceLogs).values({
      agentId,
      userId: user.id,
      input: JSON.stringify(body.messages),
      output: result.content,
      status: 'success',
      createdAt: new Date(),
    });
    
    return NextResponse.json({
      content: result.content,
      chatId: result.chatId,
    });
  } catch (error) {
    console.error('Error executing inference:', error);
    return NextResponse.json(
      { error: 'Failed to execute inference' },
      { status: 500 }
    );
  }
}

// GET /api/ai-agents/[id] - Get AI agent details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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
    
    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Error getting AI agent:', error);
    return NextResponse.json(
      { error: 'Failed to get AI agent' },
      { status: 500 }
    );
  }
}