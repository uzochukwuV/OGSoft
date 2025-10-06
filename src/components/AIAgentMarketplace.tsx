'use client';

import { useState, useEffect } from 'react';
import { useAIAgent } from '@/hooks/useAIAgent';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useWallet } from '@/hooks/useWallet';

interface AIAgentMarketplaceProps {
  activeCategory?: string;
  viewMode?: 'grid' | 'list';
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
}

export default function AIAgentMarketplace({
  activeCategory = 'all',
  viewMode = 'grid',
  sortBy = 'newest',
}: AIAgentMarketplaceProps) {
  const { fetchAgents, agents, loading, error } = useAIAgent();
  const { address, isConnected } = useWallet();
  const [filteredAgents, setFilteredAgents] = useState<any[]>([]);

  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents({ status: 'published' });
  }, [fetchAgents]);

  // Filter and sort agents when agents, activeCategory, or sortBy changes
  useEffect(() => {
    if (!agents) return;

    let filtered = [...agents];

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(agent => agent.type === activeCategory);
    }

    // Sort agents
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    setFilteredAgents(filtered);
  }, [agents, activeCategory, sortBy]);

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

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // No results
  if (filteredAgents.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-gray-500 mb-4">No AI agents found</div>
        {isConnected && (
          <Link href="/publish?type=ai-agent" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            Create an AI Agent
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAgents.map((agent) => (
            <GridAgentCard key={agent.id} agent={agent} getAgentTypeStyle={getAgentTypeStyle} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {filteredAgents.map((agent) => (
            <ListAgentCard key={agent.id} agent={agent} getAgentTypeStyle={getAgentTypeStyle} />
          ))}
        </div>
      )}
    </div>
  );
}

// Grid view card for AI agents
function GridAgentCard({ agent, getAgentTypeStyle }: { agent: any; getAgentTypeStyle: (type: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
    >
      <Link href={`/ai-agent/${agent.id}`}>
        <div className="relative h-48 w-full bg-gray-200">
          {agent.thumbnailUrl ? (
            <Image
              src={agent.thumbnailUrl}
              alt={agent.title}
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
            <h3 className="text-lg font-semibold text-gray-900 truncate">{agent.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getAgentTypeStyle(agent.type)}`}>
              {agent.type}
            </span>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{agent.description}</p>

          <div className="flex justify-between items-center">
            <div className="text-lg font-bold text-gray-900">
              {agent.price > 0 ? `${agent.price} 0G` : 'Free'}
            </div>

            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {agent.metadata.baseModel}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// List view card for AI agents
function ListAgentCard({ agent, getAgentTypeStyle }: { agent: any; getAgentTypeStyle: (type: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
    >
      <Link href={`/ai-agent/${agent.id}`}>
        <div className="flex">
          <div className="relative h-32 w-32 flex-shrink-0 bg-gray-200">
            {agent.thumbnailUrl ? (
              <Image
                src={agent.thumbnailUrl}
                alt={agent.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-gray-100">
                <svg
                  className="h-10 w-10 text-gray-400"
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

          <div className="p-4 flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{agent.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${getAgentTypeStyle(agent.type)}`}>
                {agent.type}
              </span>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{agent.description}</p>

            <div className="flex justify-between items-center">
              <div className="text-lg font-bold text-gray-900">
                {agent.price > 0 ? `${agent.price} 0G` : 'Free'}
              </div>

              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {agent.metadata.baseModel}
                </span>
                <span className="text-sm text-gray-500">
                  Created: {new Date(agent.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}