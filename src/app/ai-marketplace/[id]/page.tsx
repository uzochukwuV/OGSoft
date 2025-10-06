import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AIAgentDetail } from '@/components/AIAgentDetail';
import { db } from '@/lib/db';
import { aiAgents } from '@/lib/db/schema-ai';
import { eq } from 'drizzle-orm';

type AIAgentDetailPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: AIAgentDetailPageProps): Promise<Metadata> {
  const id = parseInt(params.id);
  
  if (isNaN(id)) {
    return {
      title: 'AI Agent Not Found',
    };
  }
  
  try {
    const agent = await db.query.aiAgents.findFirst({
      where: eq(aiAgents.id, id),
    });
    
    if (!agent) {
      return {
        title: 'AI Agent Not Found',
      };
    }
    
    return {
      title: `${agent.title} | AI Marketplace`,
      description: agent.description,
    };
  } catch (error) {
    console.error('Error fetching AI agent for metadata:', error);
    return {
      title: 'AI Agent',
    };
  }
}

export default async function AIAgentDetailPage({ params }: AIAgentDetailPageProps) {
  const id = parseInt(params.id);
  
  if (isNaN(id)) {
    notFound();
  }
  
  try {
    const agent = await db.query.aiAgents.findFirst({
      where: eq(aiAgents.id, id),
    });
    
    if (!agent) {
      notFound();
    }
    
    return (
      <div className="container mx-auto py-8">
        <AIAgentDetail agentId={id} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching AI agent:', error);
    notFound();
  }
}