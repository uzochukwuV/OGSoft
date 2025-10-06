'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from "sonner"
import { Loader2, Plus, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useWallet } from '@/hooks/useWallet';

type AIAgent = {
  id: number;
  title: string;
  type: string;
};

type CompositionRole = {
  agentId: number;
  role: string;
  order: number;
};

export function AIAgentComposer() {
  const { isConnected } = useWallet();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorizedAgents, setAuthorizedAgents] = useState<AIAgent[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [composition, setComposition] = useState<CompositionRole[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    if (isConnected) {
      fetchAuthorizedAgents();
    }
  }, [isConnected]);

  const fetchAuthorizedAgents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ai-agents/authorized');
      
      if (!response.ok) {
        throw new Error('Failed to fetch authorized agents');
      }
      
      const data = await response.json();
      setAuthorizedAgents(data.agents);
    } catch (error) {
      console.error('Error fetching authorized agents:', error);
      toast.error('Failed to fetch authorized AI agents', {
        description: 'Failed to fetch your authorized AI agents',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAgent = () => {
    if (!selectedAgentId || !selectedRole) return;
    
    const newComposition = [...composition, {
      agentId: selectedAgentId,
      role: selectedRole,
      order: composition.length,
    }];
    
    setComposition(newComposition);
    setSelectedAgentId(null);
    setSelectedRole('');
  };

  const handleRemoveAgent = (index: number) => {
    const newComposition = composition.filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, order: i }));
    setComposition(newComposition);
  };

  const handleSubmit = async () => {
    if (!title || !description || composition.length < 2) {
      toast.error('Validation Error', {
        description: 'Please fill all fields and add at least two agents to the composition',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/ai-agents/composition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          composition,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create agent composition');
      }
      
      const data = await response.json();
      
      toast.success('AI agent composition created successfully');
      
      router.push(`/ai-marketplace/${data.id}`);
    } catch (error) {
      console.error('Error creating agent composition:', error);
      toast.error('Failed to create AI agent composition', {
        description: error instanceof Error ? error.message : 'Failed to create agent composition',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAgentById = (id: number) => {
    return authorizedAgents.find(agent => agent.id === id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please sign in to create AI agent compositions
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push('/login?callbackUrl=/ai-studio/compose')}>
            Sign In
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (authorizedAgents.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insufficient AI Agents</CardTitle>
          <CardDescription>
            You need at least two authorized AI agents to create a composition
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push('/ai-marketplace')}>
            Browse AI Marketplace
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create AI Agent Composition</CardTitle>
        <CardDescription>
          Combine multiple AI agents to create a powerful collaborative system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Composition Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Multi-Agent Research Assistant"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A collaborative system that combines multiple agents for enhanced research capabilities..."
              rows={3}
            />
          </div>
        </div>
        
        <div className="border rounded-md p-4">
          <h3 className="text-lg font-medium mb-4">Agent Composition</h3>
          
          {composition.length > 0 ? (
            <div className="space-y-2 mb-4">
              {composition.map((item, index) => {
                const agent = getAgentById(item.agentId);
                return (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="mr-2">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{agent?.title || 'Unknown Agent'}</p>
                        <p className="text-sm text-muted-foreground">Role: {item.role}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAgent(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground mb-4">No agents added to composition yet</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="agent">Select Agent</Label>
              <Select
                value={selectedAgentId?.toString() || ''}
                onValueChange={(value) => setSelectedAgentId(parseInt(value))}
              >
                <SelectTrigger id="agent">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {authorizedAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="role">Agent Role</Label>
              <Input
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                placeholder="e.g., Research, Analysis, Summary"
              />
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={handleAddAgent}
                disabled={!selectedAgentId || !selectedRole}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Agent
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !title || !description || composition.length < 2}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Composition'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}