import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccount, useConnect } from 'wagmi';

/**
 * Custom hook for wallet connection management
 * Handles wallet connection status and hydration-safe wallet check
 */
export function useWallet() {
  const { address, isConnected, status } = useAccount();
  const { connect, connectors } = useConnect();
  const [initializing, setInitializing] = useState(true);
  const directWalletAddress = useRef<string | null>(null);
  const walletCheckAttempted = useRef(false);
  const isHydrated = useRef(false);
  
  // Mark as hydrated after first render
  useEffect(() => {
    isHydrated.current = true;
    
    // Process any pending actions from the queue after hydration
    if (pendingInitActions.current.length > 0) {
      setTimeout(() => {
        pendingInitActions.current.forEach(action => action());
        pendingInitActions.current = [];
      }, 100);
    }
  }, []);
  
  // Queue for actions that should run after hydration
  const pendingInitActions = useRef<(() => void)[]>([]);
  
  // Check for wallet connection
  useEffect(() => {
    // Skip during server-side rendering or if component isn't hydrated yet
    if (!isHydrated.current) {
      return;
    }
    
    const checkWalletConnection = async () => {
      // Check if ethereum exists in window
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          // Check if the user is already connected by requesting accounts
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
          const hasAccounts = accounts && accounts.length > 0;
          
          // If we have accounts but isConnected is false, there's a mismatch
          if (hasAccounts && !isConnected) {
            // Update ref without triggering state updates
            directWalletAddress.current = accounts[0];
            
            // Queue reconnection for after any hydration is complete
            setTimeout(() => {
              if (!isConnected) {
                forceReconnectWallet();
              }
            }, 1000);
          }
        } catch (err) {
          // Handle error silently
        }
      }
      
      // Use timeout to defer state updates to next tick
      setTimeout(() => {
        if (initializing) {
          setInitializing(false);
          walletCheckAttempted.current = true;
        }
      }, 0);
    };
    
    // Wait a bit for the wallet to initialize before checking
    const timeoutId = setTimeout(checkWalletConnection, 1000);
    return () => clearTimeout(timeoutId);
  }, [isConnected, initializing]);
  
  // Watch for wallet connection changes
  useEffect(() => {
    // Skip during server-side rendering or initialization phase
    if (!isHydrated.current || initializing) return;
    
    // If wagmi still reports disconnected but we know a wallet is connected via eth_accounts
    if (!isConnected && directWalletAddress.current && status === 'disconnected') {
      // After timeout, try to force reconnect if still needed
      if (walletCheckAttempted.current) {
        forceReconnectWallet();
      }
    }
  }, [isConnected, status, initializing]);
  
  // Force reconnect when needed
  const forceReconnectWallet = useCallback(() => {
    // Only attempt reconnect if hydration is complete
    if (!isHydrated.current) {
      pendingInitActions.current.push(forceReconnectWallet);
      return;
    }
    
    const injector = connectors.find(c => c.id === 'injected');
    if (injector) {
      connect({ connector: injector });
    }
  }, [connect, connectors]);
  
  // Get effective address from either wagmi or direct connection
  const getEffectiveAddress = useCallback(() => {
    return address || directWalletAddress.current;
  }, [address]);
  
  // Check if wallet is effectively connected
  const isEffectivelyConnected = useCallback(() => {
    return isConnected || !!directWalletAddress.current;
  }, [isConnected]);
  
  return {
    address: getEffectiveAddress(),
    isConnected: isEffectivelyConnected(),
    status,
    initializing,
    directWalletAddress: directWalletAddress.current,
    forceReconnectWallet
  };
} 