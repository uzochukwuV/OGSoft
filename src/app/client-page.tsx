import React from 'react';
import { Providers } from './providers';
import UploadCardContainer from '@/components/upload/UploadCardContainer';
import DownloadCardContainer from '@/components/download/DownloadCardContainer';
import ConnectButton from '@/components/ConnectButton';
import NetworkToggle from '@/components/NetworkToggle';
import SocialUploadCard from '@/components/social/SocialUploadCard';
import SocialFeed from '@/components/social/SocialFeed';
import { SocialProvider } from '@/context/SocialContext';

/**
 * Client-only version of the page that skips server-side rendering
 * to avoid hydration mismatches completely
 */
export function ClientPage() {
  return (
    <Providers>
      <SocialProvider>
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-end items-center space-x-4 mb-8">
              <NetworkToggle />
              <ConnectButton />
            </div>
            <div className="space-y-12">
              <div>
                <h1 className="text-2xl font-bold mb-4 text-blue-800 border-b-2 pb-2 border-blue-400 inline-block">Create Post</h1>
                <SocialUploadCard />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-4 text-blue-800 border-b-2 pb-2 border-blue-400 inline-block">Your Feed</h1>
                <SocialFeed />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-4 text-blue-800 border-b-2 pb-2 border-blue-400 inline-block">Upload File</h1>
                <UploadCardContainer />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-4 text-blue-800 border-b-2 pb-2 border-blue-400 inline-block">Download File</h1>
                <DownloadCardContainer />
              </div>
            </div>
          </div>
        </main>
      </SocialProvider>
    </Providers>
  );
} 