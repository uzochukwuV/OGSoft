import { useState, useCallback, useEffect } from 'react';

import { BrowserProvider } from 'ethers';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';
import { useWallet } from './useWallet';

// Define types for the hook
interface AIInferenceState {
  loading: boolean;
  error: string | null;
  balance: string | null;
  services: ServiceInfo[] | null;
  currentProvider: string | null;
}

interface ServiceInfo {
  provider: string; // Provider's wallet address
  serviceType: string;
  url: string;
  inputPrice: bigint;
  outputPrice: bigint;
  updatedAt: bigint;
  model: string;
  verifiability: string;
}

interface InferenceResult {
  success: boolean;
  content: string;
  chatId?: string;
  error?: string;
}

/**
 * Custom hook for interacting with the 0G Compute Network for AI inference
 */
export function useAIInference() {
  const { address, isConnected } = useWallet();
  const [broker, setBroker] = useState<any>(null);
  const [state, setState] = useState<AIInferenceState>({
    loading: false,
    error: null,
    balance: null,
    services: null,
    currentProvider: null,
  });

  // Initialize the broker when wallet is connected
  useEffect(() => {
    if (!isConnected || !window.ethereum) return;

    const initBroker = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const broker = await createZGComputeNetworkBroker(signer);
        
        setBroker(broker);
        
        // Get account balance
        const account = await broker.ledger.getLedger();
        const balance = account ? account.totalBalance.toString() : '0';
        
        setState(prev => ({
          ...prev,
          loading: false,
          balance,
        }));
      } catch (error) {
        console.error('Failed to initialize 0G Compute broker:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to initialize AI services. Please try again.',
        }));
      }
    };

    initBroker();
  }, [isConnected]);

  // Get available AI services
  const getServices = useCallback(async () => {
    if (!broker) return null;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const services = await broker.inference.listService();
      
      setState(prev => ({
        ...prev,
        loading: false,
        services,
      }));
      
      return services;
    } catch (error) {
      console.error('Failed to get AI services:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to retrieve AI services. Please try again.',
      }));
      return null;
    }
  }, [broker]);

  // Add funds to the account
  const addFunds = useCallback(async (amount: number) => {
    if (!broker) return false;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await broker.ledger.addLedger(amount);
      
      // Update balance
      const account = await broker.ledger.getLedger();
      const balance = account ? account.totalBalance.toString() : '0';
      
      setState(prev => ({
        ...prev,
        loading: false,
        balance,
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to add funds:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to add funds. Please try again.',
      }));
      return false;
    }
  }, [broker]);

  // Acknowledge a provider before using their service
  const acknowledgeProvider = useCallback(async (providerAddress: string) => {
    if (!broker) return false;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await broker.inference.acknowledgeProviderSigner(providerAddress);
      
      setState(prev => ({
        ...prev,
        loading: false,
        currentProvider: providerAddress,
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to acknowledge provider:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to acknowledge provider. Please try again.',
      }));
      return false;
    }
  }, [broker]);

  // Execute AI inference with a provider
  const executeInference = useCallback(async (
    providerAddress: string,
    messages: Array<{ role: string, content: string }>
  ): Promise<InferenceResult> => {
    if (!broker) {
      return {
        success: false,
        content: '',
        error: 'AI service not initialized',
      };
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Get service metadata
      const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddress);
      
      // Generate auth headers
      const headers = await broker.inference.getRequestHeaders(
        providerAddress,
        JSON.stringify(messages)
      );
      
      // Send request to the service
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          messages,
          model,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute inference');
      }
      
      const answer = data.choices[0].message.content;
      const chatId = data.id;
      
      // Verify the response if it's a verifiable service
      const isValid = await broker.inference.processResponse(
        providerAddress,
        answer,
        chatId
      );
      
      setState(prev => ({
        ...prev,
        loading: false,
      }));
      
      return {
        success: true,
        content: answer,
        chatId,
      };
    } catch (error) {
      console.error('Failed to execute inference:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to execute AI inference. Please try again.',
      }));
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, [broker]);

  return {
    ...state,
    getServices,
    addFunds,
    acknowledgeProvider,
    executeInference,
  };
}