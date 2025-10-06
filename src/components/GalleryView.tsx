import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface Artwork {
  id: number;
  title: string;
  description: string;
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
  category: string;
}

interface GalleryViewProps {
  artworks: Artwork[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  activeTab: string;
  activeCategory: string;
  getCreatorTypeStyle: (type: string) => string;
  getCategoryStyle: (category: string) => string;
}

const GalleryView: React.FC<GalleryViewProps> = ({
  artworks,
  loading,
  viewMode,
  activeTab,
  activeCategory,
  getCreatorTypeStyle,
  getCategoryStyle,
}) => {
  // Loading State
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200 animate-pulse"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-200 rounded-full mr-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // No Results
  if (!loading && artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-700">No artworks found</h3>
        <p className="text-gray-500 mt-2">
          {activeTab === 'following' 
            ? 'Follow some artists to see their work here.' 
            : activeCategory !== 'all' 
            ? `No artworks found in the ${activeCategory} category.` 
            : 'No artworks available at the moment.'}
        </p>
      </div>
    );
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
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
                <div className="mt-1">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryStyle(artwork.category)}`}>
                    {artwork.category}
                  </span>
                </div>
                <div className="mt-2 flex items-center">
                  <div className="w-6 h-6 relative rounded-full overflow-hidden mr-2">
                    {artwork.creator.profileImage ? (
                      <Image 
                        src={artwork.creator.profileImage} 
                        alt={artwork.creator.name} 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-500">{artwork.creator.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <Link href={`/artist/${artwork.creator.id}`} className="text-sm text-gray-700 hover:text-blue-500">
                    {artwork.creator.name}
                  </Link>
                </div>
                {artwork.isForSale && artwork.saleStatus === 'available' && (
                  <p className="text-lg font-bold text-blue-600 mt-2">${artwork.price}</p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-4">
      {artworks.map((artwork) => (
        <motion.div
          key={artwork.id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href={`/artwork/${artwork.id}`}>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-48 relative h-48 md:h-auto">
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
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{artwork.title}</h3>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryStyle(artwork.category)}`}>
                        {artwork.category}
                      </span>
                    </div>
                  </div>
                  {artwork.isForSale && artwork.saleStatus === 'available' && (
                    <p className="text-xl font-bold text-blue-600">${artwork.price}</p>
                  )}
                </div>
                
                <p className="text-gray-600 mt-2 line-clamp-2">{artwork.description}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 relative rounded-full overflow-hidden mr-2">
                      {artwork.creator.profileImage ? (
                        <Image 
                          src={artwork.creator.profileImage} 
                          alt={artwork.creator.name} 
                          fill 
                          className="object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-500">{artwork.creator.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <Link href={`/artist/${artwork.creator.id}`} className="text-sm text-gray-700 hover:text-blue-500">
                      {artwork.creator.name}
                    </Link>
                    {artwork.creator.artistType && (
                      <span className={`ml-2 inline-block px-2 py-1 text-xs rounded-full ${getCreatorTypeStyle(artwork.creator.artistType)}`}>
                        {artwork.creator.artistType}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{artwork.createdAt}</span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default GalleryView;