import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AIAgentService } from '@/lib/0g/ai-agent-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Environment variables for INFT contract
const INFT_CONTRACT_ADDRESS = process.env.INFT_CONTRACT_ADDRESS || '';

// Initialize the AI agent service
const aiAgentService = new AIAgentService(INFT_CONTRACT_ADDRESS);

// GET /api/ai-agents - List AI agents
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const creatorId = searchParams.get('creatorId') || undefined;
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = searchParams.has('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = searchParams.has('offset') ? parseInt(searchParams.get('offset')!) : 0;
    
    // Get AI agents
    const agents = await aiAgentService.listAIAgents({
      creatorId,
      type,
      status,
      limit,
      offset,
    });
    
    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error listing AI agents:', error);
    return NextResponse.json(
      { error: 'Failed to list AI agents' },
      { status: 500 }
    );
  }
}

// POST /api/ai-agents - Create a new AI agent
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
    
    // Validate the request body
    if (!body.title || !body.description || !body.type || !body.price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create the AI agent
    const agentId = await aiAgentService.createAIAgent({
      title: body.title,
      description: body.description,
      type: body.type,
      thumbnailUrl: body.thumbnailUrl || '',
      price: body.price,
      creatorId: user.id,
      modelDetails: {
        baseModel: body.baseModel || 'gpt-3.5-turbo',
        parameters: body.parameters || {},
        capabilities: body.capabilities || [],
        verificationMode: body.verificationMode || 'none',
      },
    });
    
    if (!agentId) {
      return NextResponse.json(
        { error: 'Failed to create AI agent' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ id: agentId });
  } catch (error) {
    console.error('Error creating AI agent:', error);
    return NextResponse.json(
      { error: 'Failed to create AI agent' },
      { status: 500 }
    );
  }
}