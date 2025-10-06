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

// GET /api/ai-agents/[id]/authorization - Check if user is authorized to use an AI agent
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { isAuthorized: false },
        { status: 200 }
      );
    }
    
    // Get the user from the database
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });
    
    if (!user) {
      return NextResponse.json(
        { isAuthorized: false },
        { status: 200 }
      );
    }
    
    // Get the agent ID from the URL
    const agentId = parseInt(params.id);
    
    if (isNaN(agentId)) {
      return NextResponse.json(
        { isAuthorized: false },
        { status: 200 }
      );
    }
    
    // Check if the user is authorized to use this agent
    const isAuthorized = await aiAgentService.isUserAuthorized(agentId, user.id);
    
    return NextResponse.json({ isAuthorized });
  } catch (error) {
    console.error('Error checking authorization:', error);
    return NextResponse.json(
      { isAuthorized: false },
      { status: 200 }
    );
  }
}