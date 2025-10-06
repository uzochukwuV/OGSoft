import { Metadata } from 'next';
import { AIAgentCreationForm } from '@/components/AIAgentCreationForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Create AI Agent | 0G Marketplace',
  description: 'Create and publish your own AI agent as an INFT on the 0G network',
};

export default async function CreateAIAgentPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/publish/ai-agent');
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create AI Agent</h1>
      <p className="text-muted-foreground mb-8">
        Create your own AI agent as an Intelligent NFT (INFT) on the 0G network. 
        Your agent will be securely stored and can be purchased by other users.
      </p>
      
      <AIAgentCreationForm />
    </div>
  );
}