'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { toast } from "sonner"
import { useAIAgent } from '@/hooks/useAIAgent';
import { Loader2, Send, ShoppingCart, Zap } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

type AIAgentDetailProps = {
  agentId: number;
};

export function AIAgentDetail({ agentId }: AIAgentDetailProps) {
  const { isConnected } = useWallet();
  const router = useRouter();

  const [userInput, setUserInput] = useState('');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  const {
    selectedAgent: agent,
    agents,
    metadata,
    loading: isLoading,
    messages: conversation,
    processing: isProcessing,
    getAgent,
    sendMessage,
  } = useAIAgent();

  useEffect(() => {
    getAgent(agentId);
  }, [getAgent, isConnected]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    try {
      await sendMessage(agentId ,userInput);
      setUserInput('');
    } catch (error) {
      toast.error("Failed to send message to agent")
    }
  };

  const handlePurchase = async () => {
    if (isConnected) {

      return;
    }
    
    setIsPurchasing(true);
    try {
      // await purchaseAgent();
      setIsAuthorized(true);
      toast.success('Successfully purchased AI agent')
    } catch (error) {
      toast.error('Failed to purchase AI agent')
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent || !metadata) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold">AI Agent not found</h2>
        <p className="mt-2">The requested AI agent could not be found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{agent.title}</CardTitle>
              <CardDescription className="mt-2">{agent.description}</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="px-3 py-1">
                {agent.type}
              </Badge>
              <div className="text-xl font-bold">
                {agent.price} 0G
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Agent Details</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">Base Model:</span>
                  <p>{metadata.baseModel}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Capabilities:</span>
                  <p>{metadata.capabilities}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Verification Mode:</span>
                  <p>{metadata.verificationMode}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Creator</h3>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={agent.thumbnailUrl || ''} />
                  <AvatarFallback>{agent.creatorId?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{agent.creatorId}</p>
                  <p className="text-sm text-muted-foreground">Creator</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {isAuthorized === false && (
            <Button 
              onClick={handlePurchase} 
              disabled={isPurchasing}
              className="w-full"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Purchase for {agent.price} 0G
                </>
              )}
            </Button>
          )}
          {isAuthorized === true && (
            <Badge variant="secondary" className="px-3 py-1">
              <Zap className="mr-1 h-4 w-4" />
              Authorized
            </Badge>
          )}
        </CardFooter>
      </Card>

      {isAuthorized === true && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
            <CardDescription>Interact with your AI agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] overflow-y-auto border rounded-md p-4 mb-4">
              {conversation.length === 0 ? (
                <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                  <p>Start a conversation with your AI agent</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversation.map((message: any, index: any) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] p-3 rounded-lg bg-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!userInput.trim() || isLoading}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}