import { useState, useCallback } from 'react';

import { useAIInference } from './useAIInference';
import { useWallet } from './useWallet';

// Define types for the hook
export interface AIAgent {
  id: number;
  title: string;
  description: string;
  type: string;
  thumbnailUrl: string;
  price: number;
  creatorId: string;
  status: string;
  inftTokenId: number | null;
  inftContractAddress: string | null;
  inftMetadataUri: string | null;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    baseModel: string;
    parameters: Record<string, any>;
    capabilities: string[];
    verificationMode: string;
  };
}

interface Message {
  role: string;
  content: string;
}

interface AIAgentState {
  loading: boolean;
  error: string | null;
  agents: AIAgent[] | null;
  selectedAgent: AIAgent | null;
  messages: Message[];
  response: string | null;
}

/**
 * Custom hook for interacting with AI agents
 */
export function useAIAgent() {
  const { address, isConnected } = useWallet();
  const { acknowledgeProvider, executeInference } = useAIInference();
  
  const [state, setState] = useState<AIAgentState>({
    loading: false,
    error: null,
    agents: null,
    selectedAgent: null,
    messages: [],
    response: null,
  });

  // Fetch AI agents
  const fetchAgents = useCallback(async (filters?: {
    creatorId?: string;
    type?: string;
    status?: string;
  }) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters?.creatorId) {
        params.append('creatorId', filters.creatorId);
      }
      
      if (filters?.type) {
        params.append('type', filters.type);
      }
      
      if (filters?.status) {
        params.append('status', filters.status);
      }
      
      // Fetch agents from the API
      const response = await fetch(`/api/ai-agents?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI agents');
      }
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        loading: false,
        agents: data.agents,
      }));
      
      return data.agents;
    } catch (error) {
      console.error('Error fetching AI agents:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch AI agents',
      }));
      return null;
    }
  }, []);

  // Get a single AI agent
  const getAgent = useCallback(async (agentId: number) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch agent from the API
      const response = await fetch(`/api/ai-agents/${agentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI agent');
      }
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        loading: false,
        selectedAgent: data.agent,
      }));
      
      return data.agent;
    } catch (error) {
      console.error('Error fetching AI agent:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch AI agent',
      }));
      return null;
    }
  }, []);

  // Create a new AI agent
  const createAgent = useCallback(async (agentData: {
    title: string;
    description: string;
    type: string;
    thumbnailUrl?: string;
    price: number;
    baseModel?: string;
    parameters?: Record<string, any>;
    capabilities?: string[];
    verificationMode?: string;
  }) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Create agent via the API
      const response = await fetch('/api/ai-agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create AI agent');
      }
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        loading: false,
      }));
      
      return data.id;
    } catch (error) {
      console.error('Error creating AI agent:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create AI agent',
      }));
      return null;
    }
  }, []);

  // Send a message to an AI agent
  const sendMessage = useCallback(async (agentId: number, message: string) => {
    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        messages: [...prev.messages, { role: 'user', content: message }],
      }));
      
      // Get the agent if not already selected
      let agent = state.selectedAgent;
      
      if (!agent || agent.id !== agentId) {
        agent = await getAgent(agentId);
        
        if (!agent) {
          throw new Error('Failed to get AI agent');
        }
      }
      
      // Acknowledge the provider if needed
      if (agent.inftContractAddress) {
        await acknowledgeProvider(agent.inftContractAddress);
      }
      
      // Send the message to the agent
      const response = await fetch(`/api/ai-agents/${agentId}/inference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...state.messages, { role: 'user', content: message }],
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message to AI agent');
      }
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        loading: false,
        messages: [...prev.messages, { role: 'assistant', content: data.content }],
        response: data.content,
      }));
      
      return data.content;
    } catch (error) {
      console.error('Error sending message to AI agent:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to send message to AI agent',
      }));
      return null;
    }
  }, [state.selectedAgent, state.messages, getAgent, acknowledgeProvider]);

  // Clear the conversation
  const clearConversation = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      response: null,
    }));
  }, []);

  return {
    ...state,
    metadata: state.selectedAgent?.metadata,
    processing: state.selectedAgent?.status,
    fetchAgents,
    getAgent,
    createAgent,
    sendMessage,
    clearConversation,
  };
}