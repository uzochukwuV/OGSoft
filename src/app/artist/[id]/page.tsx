'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

interface Artist {
  id: number;
  name: string;
  address: string;
  bio: string;
  profileImage: string;
  artistType: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

interface Artwork {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: string;
  isForSale: boolean;
  saleStatus: string;
  createdAt: string;
  medium?: string;
  dimensions?: string;
}

const ArtistProfile = () => {
  const params = useParams();
  const artistId = params.id as string;
  
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  
  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        // Fetch artist profile data
        const artistResponse = await fetch(`/api/users/${artistId}`);
        if (!artistResponse.ok) throw new Error('Failed to fetch artist data');
        const artistData = await artistResponse.json();
        setArtist(artistData.user);
        
        // Fetch artist's artworks
        const artworksResponse = await fetch(`/api/marketplace?artistId=${artistId}&status=${activeTab}`);
        if (!artworksResponse.ok) throw new Error('Failed to fetch artworks');
        const artworksData = await artworksResponse.json();
        setArtworks(artworksData.listings.map((item: any) => ({
          id: item.content.id,
          title: item.content.title,
          description: item.content.description,
          thumbnailUrl: `/api/thumbnails/${item.content.id}`,
          price: item.content.price,
          isForSale: item.content.isForSale,
          saleStatus: item.content.saleStatus,
          createdAt: new Date(item.content.createdAt).toLocaleDateString(),
          medium: item.artworkDetails?.medium,
          dimensions: item.artworkDetails?.dimensions,
        })));
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtistData();
  }, [artistId, activeTab]);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
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
  
  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Artist not found</h1>
            <p className="mt-4 text-gray-600">The artist you are looking for does not exist or has been removed.</p>
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
        {/* Artist Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="w-32 h-32 md:w-48 md:h-48 relative rounded-full overflow-hidden mb-4 md:mb-0 md:mr-8">
              {artist.profileImage ? (
                <Image 
                  src={artist.profileImage} 
                  alt={artist.name} 
                  fill 
                  className="object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-4xl text-gray-500">{artist.name.charAt(0)}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800">{artist.name}</h1>
              <p className="text-sm text-gray-500 mt-1">{artist.artistType}</p>
              
              <div className="mt-4">
                <p className="text-gray-700">{artist.bio || 'No bio available'}</p>
              </div>
              
              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                {artist.socialLinks?.twitter && (
                  <a href={artist.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                    <i className="fab fa-twitter mr-2"></i>Twitter
                  </a>
                )}
                {artist.socialLinks?.instagram && (
                  <a href={artist.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-700">
                    <i className="fab fa-instagram mr-2"></i>Instagram
                  </a>
                )}
                {artist.socialLinks?.website && (
                  <a href={artist.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900">
                    <i className="fas fa-globe mr-2"></i>Website
                  </a>
                )}
              </div>
              
              <div className="mt-6">
                <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                  Commission Artist
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Artwork Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'available' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTabChange('available')}
            >
              Available Works
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'sold' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTabChange('sold')}
            >
              Sold Works
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTabChange('all')}
            >
              All Works
            </button>
          </div>
        </div>
        
        {/* Artwork Grid */}
        {artworks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {artworks.map((artwork) => (
              <motion.div
                key={artwork.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/artwork/${artwork.id}`}>
                  <div className="relative h-48 w-full">
                    <Image
                      src={artwork.thumbnailUrl}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                    />
                    {artwork.isForSale && artwork.saleStatus === 'available' && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs rounded">
                        For Sale
                      </div>
                    )}
                    {artwork.saleStatus === 'sold' && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                        Sold
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{artwork.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{artwork.medium}</p>
                    {artwork.dimensions && (
                      <p className="text-xs text-gray-500 mt-1">{artwork.dimensions}</p>
                    )}
                    {artwork.isForSale && artwork.saleStatus === 'available' && (
                      <p className="text-lg font-bold text-blue-600 mt-2">${artwork.price}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Created: {artwork.createdAt}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-700">No artworks found</h3>
            <p className="text-gray-500 mt-2">
              {activeTab === 'available' 
                ? 'This artist has no available works for sale at the moment.' 
                : activeTab === 'sold' 
                ? 'This artist has not sold any works yet.' 
                : 'This artist has not uploaded any works yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistProfile;