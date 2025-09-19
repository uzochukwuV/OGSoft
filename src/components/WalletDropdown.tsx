'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletContext } from '@/context/WalletContext';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import ProfileUpdateModal from './ProfileUpdateModal';
import ConnectButton from '@/components/ConnectButton';

interface WalletDropdownProps {
  className?: string;
}

export default function WalletDropdown({ className = '' }: WalletDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isFirstConnection, setIsFirstConnection] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { address, isConnected, isConnecting, connect, balance } = useWalletContext();
  const { open } = useWeb3Modal();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Check if this is the first time connecting
  useEffect(() => {
    if (isConnected && address) {
      // In a real app, you would check if the user exists in your database
      // For demo purposes, we'll use localStorage to simulate this check
      const hasCompletedProfile = localStorage.getItem(`profile-${address}`);
      
      if (!hasCompletedProfile) {
        // This is a first-time user
        setIsFirstConnection(true);
        setShowProfileModal(true);
        // Store that we've shown the profile modal to this address
        localStorage.setItem(`profile-${address}`, 'true');
      }
    }
  }, [isConnected, address]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <motion.button
        onClick={toggleDropdown}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="flex items-center justify-center"
      >
        {isConnected ? (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs overflow-hidden">
            {address ? address.slice(2, 4).toUpperCase() : 'W'}
          </div>
        ) : (
          <span className="material-icons text-gray-300">account_circle</span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
          >
            {isConnected ? (
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
                    {address ? address.slice(2, 4).toUpperCase() : 'W'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                    </p>
                    <p className="text-xs text-gray-400">
                      {balance.loading ? 'Loading...' : `${balance.formatted || '0'} ${balance.symbol || ''}`}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md flex items-center"
                  >
                    <span className="material-icons text-sm mr-2">person</span>
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      open();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md flex items-center"
                  >
                    <span className="material-icons text-sm mr-2">account_balance_wallet</span>
                    Wallet Settings
                  </button>
                  <div className="border-t border-gray-700 my-2"></div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      // Implement disconnect functionality
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-md flex items-center"
                  >
                    <span className="material-icons text-sm mr-2">logout</span>
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <h3 className="text-white font-medium mb-2">Connect Wallet</h3>
                <p className="text-gray-400 text-sm mb-4">Connect your wallet to access all features</p>
                <ConnectButton />
                <button
                  onClick={() => {
                    setIsOpen(false);
                    connect();

                    open()
                    console.log('Connected to wallet', isConnected, address);
                  }}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <span className="material-icons text-sm mr-2">account_balance_wallet</span>
                  Connect Wallet
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Profile Update Modal */}
      <ProfileUpdateModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        isFirstTimeUser={isFirstConnection}
      />
    </div>
  );
}