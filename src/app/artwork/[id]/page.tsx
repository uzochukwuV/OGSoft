'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useWallet } from '@/hooks/useWallet';
// import { useNetwork } from '@/hooks/useNetwork';

interface Artwork {
  id: number;
  title: string;
  description: string;
  rootHash: string;
  thumbnailUrl: string;
  price: string;
  isForSale: boolean;
  saleStatus: string;
  createdAt: string;
  creator: {
    id: number;
    name: string;
    address: string;
    profileImage?: string;
    artistType?: string;
  };
  artworkDetails?: {
    medium?: string;
    dimensions?: string;
    edition?: string;
    editionCount?: number;
    isOriginal?: boolean;
    createdYear?: string;
    materials?: string;
    framed?: boolean;
    frameDetails?: string;
  };
}

const ArtworkDetail = () => {
  const params = useParams();
  const router = useRouter();
  const artworkId = params.id as string;
  const { address, forceReconnectWallet: connect } = useWallet();
  // const { network, switchNetwork } = useNetwork();
  
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchArtworkData = async () => {
      try {
        // Fetch artwork data
        const response = await fetch(`/api/content/${artworkId}`);
        if (!response.ok) throw new Error('Failed to fetch artwork data');
        const data = await response.json();
        
        // Transform the data to match our interface
        setArtwork({
          id: data.content.id,
          title: data.content.title,
          description: data.content.description,
          rootHash: data.content.rootHash,
          thumbnailUrl: `/api/thumbnails/${data.content.id}`,
          price: data.content.price || '0',
          isForSale: data.content.isForSale || false,
          saleStatus: data.content.saleStatus || 'unavailable',
          createdAt: new Date(data.content.createdAt).toLocaleDateString(),
          creator: {
            id: data.creator.id,
            name: data.creator.name || 'Unknown Artist',
            address: data.creator.address,
            profileImage: data.creator.profileImage,
            artistType: data.creator.artistType,
          },
          artworkDetails: data.artworkDetails || {},
        });
      } catch (error) {
        console.error('Error fetching artwork data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtworkData();
  }, [artworkId]);
  
  const handlePurchase = async () => {
    if (!artwork || !address) return;
    
    try {
      setPurchasing(true);
      setPurchaseStatus('processing');
      setPurchaseError(null);
      
      // In a real implementation, this would:
      // 1. Initiate a blockchain transaction to transfer ownership
      // 2. Wait for transaction confirmation
      // 3. Update the database with the new owner
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate transaction hash
      const simulatedTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setTxHash(simulatedTxHash);
      
      // Update the database with purchase information
      const response = await fetch('/api/marketplace/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId: artwork.id,
          buyerAddress: address,
          txHash: simulatedTxHash,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete purchase');
      }
      
      setPurchaseStatus('success');
      
      // Refresh artwork data after purchase
      setTimeout(() => {
        router.refresh();
      }, 3000);
      
    } catch (error) {
      console.error('Error purchasing artwork:', error);
      setPurchaseStatus('error');
      setPurchaseError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setPurchasing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!artwork) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Artwork not found</h1>
            <p className="mt-4 text-gray-600">The artwork you are looking for does not exist or has been removed.</p>
            <Link href="/dashboard" className="mt-6 inline-block px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Artwork Image */}
            <div className="md:w-1/2 relative">
              <div className="relative h-96 md:h-full w-full">
                <Image
                  src={artwork.thumbnailUrl}
                  alt={artwork.title}
                  fill
                  className="object-contain"
                />
                {artwork.isForSale && artwork.saleStatus === 'available' && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    For Sale
                  </div>
                )}
                {artwork.saleStatus === 'sold' && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Sold
                  </div>
                )}
              </div>
            </div>
            
            {/* Artwork Details */}
            <div className="md:w-1/2 p-6">
              <h1 className="text-3xl font-bold text-gray-800">{artwork.title}</h1>
              
              <div className="mt-4 flex items-center">
                <div className="w-10 h-10 relative rounded-full overflow-hidden mr-3">
                  {artwork.creator.profileImage ? (
                    <Image 
                      src={artwork.creator.profileImage} 
                      alt={artwork.creator.name} 
                      fill 
                      className="object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm text-gray-500">{artwork.creator.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div>
                  <Link href={`/artist/${artwork.creator.id}`} className="text-blue-500 hover:text-blue-700 font-medium">
                    {artwork.creator.name}
                  </Link>
                  <p className="text-sm text-gray-500">{artwork.creator.artistType || 'Artist'}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-gray-700">{artwork.description}</p>
              </div>
              
              {/* Artwork Metadata */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                {artwork.artworkDetails?.medium && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Medium</h3>
                    <p className="text-gray-800">{artwork.artworkDetails.medium}</p>
                  </div>
                )}
                
                {artwork.artworkDetails?.dimensions && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Dimensions</h3>
                    <p className="text-gray-800">{artwork.artworkDetails.dimensions}</p>
                  </div>
                )}
                
                {artwork.artworkDetails?.createdYear && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Year</h3>
                    <p className="text-gray-800">{artwork.artworkDetails.createdYear}</p>
                  </div>
                )}
                
                {artwork.artworkDetails?.isOriginal !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Original</h3>
                    <p className="text-gray-800">{artwork.artworkDetails.isOriginal ? 'Yes' : 'No'}</p>
                  </div>
                )}
                
                {artwork.artworkDetails?.edition && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Edition</h3>
                    <p className="text-gray-800">{artwork.artworkDetails.edition} of {artwork.artworkDetails.editionCount || 'Unknown'}</p>
                  </div>
                )}
                
                {artwork.artworkDetails?.materials && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Materials</h3>
                    <p className="text-gray-800">{artwork.artworkDetails.materials}</p>
                  </div>
                )}
                
                {artwork.artworkDetails?.framed !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Framed</h3>
                    <p className="text-gray-800">{artwork.artworkDetails.framed ? 'Yes' : 'No'}</p>
                  </div>
                )}
                
                {artwork.artworkDetails?.frameDetails && artwork.artworkDetails.framed && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Frame Details</h3>
                    <p className="text-gray-800">{artwork.artworkDetails.frameDetails}</p>
                  </div>
                )}
              </div>
              
              {/* Purchase Section */}
              {artwork.isForSale && artwork.saleStatus === 'available' && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Price</h3>
                      <p className="text-3xl font-bold text-blue-600">${artwork.price}</p>
                    </div>
                    
                    {address ? (
                      <button
                        onClick={handlePurchase}
                        disabled={purchasing || purchaseStatus === 'success'}
                        className={`px-6 py-3 rounded-md text-white font-medium ${purchasing || purchaseStatus === 'success' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {purchasing ? 'Processing...' : purchaseStatus === 'success' ? 'Purchased' : 'Purchase Now'}
                      </button>
                    ) : (
                      <button
                        onClick={connect}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                      >
                        Connect Wallet to Purchase
                      </button>
                    )}
                  </div>
                  
                  {/* Purchase Status Messages */}
                  {purchaseStatus === 'processing' && (
                    <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-700 mr-2"></div>
                      <p>Processing your purchase. Please wait...</p>
                    </div>
                  )}
                  
                  {purchaseStatus === 'success' && (
                    <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
                      <p className="font-medium">Purchase successful!</p>
                      <p className="text-sm mt-1">Transaction Hash: {txHash}</p>
                      <p className="text-sm mt-2">The artwork is now yours. You can view it in your collection.</p>
                    </div>
                  )}
                  
                  {purchaseStatus === 'error' && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                      <p className="font-medium">Purchase failed</p>
                      <p className="text-sm mt-1">{purchaseError || 'An error occurred during the purchase process.'}</p>
                      <button
                        onClick={handlePurchase}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Social Sharing */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Share</h3>
                <div className="mt-2 flex space-x-4">
                  <button className="text-gray-500 hover:text-blue-600">
                    <i className="fab fa-twitter text-xl"></i>
                  </button>
                  <button className="text-gray-500 hover:text-pink-600">
                    <i className="fab fa-instagram text-xl"></i>
                  </button>
                  <button className="text-gray-500 hover:text-blue-800">
                    <i className="fab fa-facebook text-xl"></i>
                  </button>
                  <button className="text-gray-500 hover:text-green-600">
                    <i className="fas fa-link text-xl"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Download Original Button */}
        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-md font-medium inline-flex items-center">
            <i className="fas fa-download mr-2"></i>
            Download Preview
          </button>
          <p className="text-sm text-gray-500 mt-2">A watermarked preview is available for download. Purchase to get the full resolution artwork.</p>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail;