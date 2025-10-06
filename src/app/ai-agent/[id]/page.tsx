'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAIAgent } from '@/hooks/useAIAgent';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';

export default function AIAgentDetailPage() {
  const params = useParams();
  const agentId = parseInt(params.id as string);
  const { getAgent, selectedAgent, sendMessage, messages, loading, error, clearConversation } = useAIAgent();
  const { address, isConnected } = useWallet();
  const [inputMessage, setInputMessage] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch agent on component mount
  useEffect(() => {
    if (agentId) {
      getAgent(agentId);
    }
  }, [agentId, getAgent]);

  // Check if user is authorized to use this agent
  useEffect(() => {
    const checkAuthorization = async () => {
      if (!selectedAgent || !isConnected) return;

      try {
        const response = await fetch(`/api/ai-agents/${agentId}/authorization`);
        const data = await response.json();
        setIsAuthorized(data.isAuthorized);
      } catch (error) {
        console.error('Error checking authorization:', error);
        setIsAuthorized(false);
      }
    };

    checkAuthorization();
  }, [selectedAgent, isConnected, agentId]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    await sendMessage(agentId, inputMessage);
    setInputMessage('');
  };

  // Handle purchase agent
  const handlePurchaseAgent = async () => {
    if (!selectedAgent || !isConnected) return;

    try {
      const response = await fetch(`/api/ai-agents/${agentId}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to purchase agent');
      }

      // Refresh authorization status
      setIsAuthorized(true);
    } catch (error) {
      console.error('Error purchasing agent:', error);
    }
  };

  // Loading state
  if (!selectedAgent) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Get agent type style
  const getAgentTypeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case 'chatbot':
        return 'bg-blue-100 text-blue-800';
      case 'assistant':
        return 'bg-purple-100 text-purple-800';
      case 'creative':
        return 'bg-pink-100 text-pink-800';
      case 'coding':
        return 'bg-green-100 text-green-800';
      case 'research':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agent Info */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg overflow-hidden shadow-md"
          >
            <div className="relative h-48 w-full bg-gray-200">
              {selectedAgent.thumbnailUrl ? (
                <Image
                  src={selectedAgent.thumbnailUrl}
                  alt={selectedAgent.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-gray-100">
                  <svg
                    className="h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{selectedAgent.title}</h1>
                <span className={`text-xs px-2 py-1 rounded-full ${getAgentTypeStyle(selectedAgent.type)}`}>
                  {selectedAgent.type}
                </span>
              </div>

              <p className="text-gray-600 mb-4">{selectedAgent.description}</p>

              <div className="border-t border-gray-200 pt-4">
                <h2 className="text-lg font-semibold mb-2">Agent Details</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Model:</span>
                    <span className="font-medium">{selectedAgent.metadata.baseModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verification:</span>
                    <span className="font-medium">{selectedAgent.metadata.verificationMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-blue-600">
                      {selectedAgent.price > 0 ? `${selectedAgent.price} 0G` : 'Free'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h2 className="text-lg font-semibold mb-2">Capabilities</h2>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.metadata.capabilities.map((capability: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>

              {!isAuthorized && (
                <div className="mt-6">
                  {isConnected ? (
                    <button
                      onClick={handlePurchaseAgent}
                      className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
                    >
                      {selectedAgent.price > 0 ? `Purchase for ${selectedAgent.price} 0G` : 'Get for Free'}
                    </button>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-600 mb-2">Connect your wallet to purchase this agent</p>
                      {/* Wallet connect button would go here */}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[600px]"
          >
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Chat with {selectedAgent.title}</h2>
              <button
                onClick={clearConversation}
                className="text-gray-500 hover:text-gray-700"
                title="Clear conversation"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <p>Start a conversation with {selectedAgent.title}</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 p-4">
              {isAuthorized ? (
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || !inputMessage.trim()}
                  >
                    {loading ? (
                      <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-2">
                  <p className="text-gray-600 mb-2">
                    You need to purchase this agent to start a conversation
                  </p>
                  {isConnected ? (
                    <button
                      onClick={handlePurchaseAgent}
                      className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
                    >
                      {selectedAgent.price > 0 ? `Purchase for ${selectedAgent.price} 0G` : 'Get for Free'}
                    </button>
                  ) : (
                    <p>Connect your wallet to purchase</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}