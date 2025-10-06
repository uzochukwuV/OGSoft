'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import WalletDropdown from '@/components/WalletDropdown';
import GalleryView from '@/components/GalleryView';

// Helper functions for creator types and social icons
const getCreatorTypeColor = (type: string) => {
  switch (type) {
    case 'AI Artist':
      return 'bg-purple-900 text-purple-200';
    case 'Comic Artist':
      return 'bg-orange-900 text-orange-200';
    case 'Traditional Painter':
      return 'bg-amber-900 text-amber-200';
    case 'Fashion Brand':
      return 'bg-pink-900 text-pink-200';
    case 'Photographer & Educator':
      return 'bg-teal-900 text-teal-200';
    default:
      return 'bg-gray-800 text-gray-200';
  }
};

const getCategoryBorderColor = (category: string) => {

  switch (category) {
    case 'AI Art':
      return 'border-purple-500';
    case 'Comics':
      return 'border-orange-500';
    case 'Traditional Art':
      return 'border-amber-500';
    case 'Fashion':
      return 'border-pink-500';
    case 'Photography':
      return 'border-teal-500';
    case 'Education':
      return 'border-blue-500';
    default:
      return 'border-gray-600';
  }
};

const getCategoryBadgeColor = (category: string) => {

  switch (category) {
    case 'AI Art':
      return 'bg-purple-900 text-purple-200';
    case 'Comics':
      return 'bg-orange-900 text-orange-200';
    case 'Traditional Art':
      return 'bg-amber-900 text-amber-200';
    case 'Fashion':
      return 'bg-pink-900 text-pink-200';
    case 'Photography':
      return 'bg-teal-900 text-teal-200';
    case 'Education':
      return 'bg-blue-900 text-blue-200';
    default:
      return 'bg-gray-800 text-gray-200';
  }
};

const getSocialIcon = (social: string) => {

  switch (social) {
    case 'twitter':
      return 'flutter_dash';
    case 'instagram':
      return 'camera_alt';
    case 'youtube':
      return 'play_circle';
    default:
      return 'share';
  }
};

const getSocialIconColor = (social: string) => {

  switch (social) {
    case 'twitter':
      return 'text-blue-400';
    case 'instagram':
      return 'text-pink-400';
    case 'youtube':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [activeCategory, setActiveCategory] = useState('all');
  const [mounted, setMounted] = useState(false);
  const [followedCreators, setFollowedCreators] = useState(['@SophiaArt', '@ComicMaster', '@PhotoPro']);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    setMounted(true);
    fetchArtworks();
  }, [activeTab, activeCategory, sortBy]);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      // Construct query parameters based on active filters
      let queryParams = new URLSearchParams();
      
      if (activeCategory !== 'all') {
        queryParams.append('category', activeCategory);
      }
      
      if (activeTab === 'Following' && followedCreators.length > 0) {
        // Extract creator IDs from followedCreators
        const creatorIds = followedCreators.map(creator => creator.replace('@', ''));
        queryParams.append('creators', creatorIds.join(','));
      }
      
      queryParams.append('sort', sortBy);
      
      const response = await fetch(`/api/marketplace?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.artworks) {
        setArtworks(data.artworks);
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const tabs = ['Home', 'Following', 'Trending'];
  
  const categories = [
    { id: 'all', name: 'All Content', icon: 'grid_view' },
    { id: 'ai-art', name: 'AI Art', icon: 'auto_awesome' },
    { id: 'comics', name: 'Comics', icon: 'auto_stories' },
    { id: 'traditional-art', name: 'Traditional Art', icon: 'palette' },
    { id: 'photography', name: 'Photography', icon: 'photo_camera' },
    { id: 'brand', name: 'Brands', icon: 'shopping_bag' }
  ];
  
  // Helper function to convert our styling functions to what GalleryView expects
  const getCreatorTypeStyle = (type: string) => {
    return getCreatorTypeColor(type);
  };
  
  const getCategoryStyle = (category: string) => {
    return getCategoryBadgeColor(category);
  };

  const posts = [
    {
      id: 1,
      title: 'AI-Generated Abstract Art',
      description: 'Explore the latest abstract art created with AI. This piece combines vibrant colors and dynamic shapes to evoke emotion and intrigue.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeq5Q_F_FyLYPpll13CtF1xS-45_Ry-BRj8gF0qifg6JyD6OM2Z9Np2tAGQSO9xouvXSP89GypRQKwgBIOkLt3d2sVO0DnqRyh0s7B2MqbhXjiO1kvK86852DCpYJGlkBKSMUp6Qk46Q1D_Zd5Xf4pbQn7Mm4o7DrfynrEo-2-uA7WmmVWwy0V0av7A8UobQaZQ2ucv8gJsYFWF0Xo03-Ft1l1Tkl5s46rXBRUI2Jqy5F3ukGgqI_JSDoBskmlqBgWje0NfJAiSG8',
      creator: {
        name: '@SophiaArt',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3EPFg_XqZ2TWou8w2kB97scy5HWSW7k93p9Oj7pd4vT77ba7XQjTXoJ0Mia3AErN4Ot7xTQ01Yd_rEmaWvwZWhFZN0pU8zy_tvQTasf40yN-vwxi6RsnMOuDxZ0bD2nt0lw2-U30AnUBUXBxd6yJ4Ml-4i_TC7f_IDfBMQ-Xpw82OKe5OgFyGLwXi9EKge-ZiDoioI1FSPkNT9OH6kNTNWiuA93D3IJVbX__qtSLVHEScSVnTxP-ZixRIF1trviA2XKa8S6DJp6o',
        type: 'AI Artist'
      },
      price: '$15.00',
      likes: '1.2k',
      comments: '345',
      badge: {
        text: 'AI Enhanced',
        icon: 'auto_awesome',
        color: 'purple'
      },
      status: {
        text: 'Processing enhancements...',
        color: 'gray'
      },
      socials: ['twitter', 'instagram'],
      category: 'ai-art'
    },
    {
      id: 2,
      title: 'Futuristic Cityscape',
      description: 'A stunning cityscape of the future, designed with AI. The image features towering skyscrapers, flying vehicles, and advanced technology.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMZ06ZZoIL3ODE1FTzL1G9p-kdo6ZRjMeLqeCrPjHsXCH0y8prmzDGELLxGo-j6TeUXIRGNx9J-1gOlNX_Xzu9YNHRrXgEMMTGMP0SCsn273CHu7fMMJsgrh_DiHVcrO8-uFvywk6eCuj3cukSts3t0pBowWBvqRSXcUO_vR0fF15-JE21MxdtckSpk0d9V17OEHHLYo9-uphppzf6A1evpPkypcFXeBw4LFmzHxppQuiOlerVQ284lBJtFkxC3IJ1LkxD2Zqgji8',
      creator: {
        name: '@EthanDesign',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCajcLNXT5HnJVOLE-LZNam-rQGbKstwQUCfyH3Li7c4gSEbyxCbc2IM8NhWB-h37Vwd-7MBOuDzFPECGxXyti2S0sH2tI_OLNKonexUD5N7meloRuK-p40JgTXDcVbAeDGpSaGiWgC65FJp7o9feDqLn7wSUpEgUIXmER3uNyunomsZpYD6ZntEFAVK-mv9uuP_I942fQy7q6bmaEZb__WXoLVMExeDGm73mROMO4xtDbMYzmk_y9biMmSMacfjT8yWbjoHPj9cCM',
        type: 'AI Artist'
      },
      likes: '2.5k',
      comments: '512',
      badge: {
        text: 'AI Co-created',
        icon: 'group_work',
        color: 'cyan'
      },
      status: {
        text: 'Evolving...',
        color: 'green'
      },
      performance: {
        instagram: '12.3k views',
        youtube: '8.1k views',
        twitter: '4.5k likes'
      },
      isReversed: true,
      category: 'ai-art'
    },
    {
      id: 3,
      title: 'Cosmic Voyage - Comic Series',
      description: 'A thrilling comic series that follows the adventures of space explorers discovering new worlds and civilizations beyond our galaxy.',
      image: 'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?q=80&w=2070&auto=format&fit=crop',
      creator: {
        name: '@ComicMaster',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop',
        type: 'Comic Artist'
      },
      price: '$8.99',
      likes: '3.4k',
      comments: '782',
      badge: {
        text: 'Comic Series',
        icon: 'auto_stories',
        color: 'orange'
      },
      status: {
        text: 'Issue #5 Coming Soon',
        color: 'blue'
      },
      socials: ['twitter', 'instagram', 'youtube'],
      category: 'comics'
    },
    {
      id: 4,
      title: 'Sunset Over Mountains',
      description: 'A breathtaking oil painting capturing the serene beauty of a mountain landscape at sunset, with vibrant colors reflecting off the snow-capped peaks.',
      image: 'https://images.unsplash.com/photo-1617634188234-62e0b2203b37?q=80&w=1974&auto=format&fit=crop',
      creator: {
        name: '@ClassicPainter',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop',
        type: 'Traditional Painter'
      },
      price: '$450.00',
      likes: '5.7k',
      comments: '342',
      badge: {
        text: 'Oil Painting',
        icon: 'palette',
        color: 'amber'
      },
      status: {
        text: 'Original Available',
        color: 'green'
      },
      socials: ['instagram'],
      category: 'traditional-art',
      isReversed: true
    },
    {
      id: 5,
      title: 'Urban Lifestyle Collection',
      description: 'Our latest fashion collection inspired by urban street culture and sustainable materials. Each piece tells a story of modern city life.',
      image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1974&auto=format&fit=crop',
      creator: {
        name: '@UrbanThreads',
        avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=1974&auto=format&fit=crop',
        type: 'Fashion Brand'
      },
      likes: '8.9k',
      comments: '1.2k',
      badge: {
        text: 'Brand Collection',
        icon: 'shopping_bag',
        color: 'pink'
      },
      performance: {
        instagram: '45.3k views',
        youtube: '22.1k views',
        twitter: '15.5k likes'
      },
      category: 'brand'
    },
    {
      id: 6,
      title: 'Digital Photography Masterclass',
      description: 'Learn the secrets of professional photography with this comprehensive masterclass covering everything from composition to advanced editing techniques.',
      image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop',
      creator: {
        name: '@PhotoPro',
        avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=1780&auto=format&fit=crop',
        type: 'Photographer & Educator'
      },
      price: '$129.00',
      likes: '4.2k',
      comments: '876',
      badge: {
        text: 'Educational Content',
        icon: 'school',
        color: 'teal'
      },
      status: {
        text: 'Enrollment Open',
        color: 'green'
      },
      socials: ['youtube', 'instagram', 'twitter'],
      category: 'photography',
      isReversed: true
    }
  ];

  // Sidebar links moved to Navbar component

  return (
    <div className="flex min-h-screen bg-[#111111] text-[#E0E0E0] font-sans">
      {/* Sidebar */}
      <Navbar activeLink={activeTab} />

      {/* Main Content */}
      <main className="ml-64 flex-1 p-6 md:p-12">
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <h2 className="text-4xl font-bold text-white">Feed</h2>
          <div className="flex items-center space-x-4">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <span className="material-icons">notifications_none</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <span className="material-icons">apps</span>
            </motion.button>
            <WalletDropdown />
          </div>
        </motion.header>

        <div className="feed-header flex items-center border-b border-gray-700 mb-8">
          {tabs.map((tab, index) => (
            <motion.button
              key={index}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 relative ${activeTab === tab ? 'text-white' : 'text-gray-400'}`}
              whileHover={{ color: '#FFFFFF' }}
              whileTap={{ scale: 0.95 }}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"
                  layoutId="activeTabIndicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          ))}
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="category-filters flex flex-wrap gap-2"
          >
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center py-2 px-4 rounded-full text-sm ${activeCategory === category.id ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="material-icons text-sm mr-2">{category.icon}</span>
                {category.name}
              </motion.button>
            ))}
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
              <motion.button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="material-icons">grid_view</span>
              </motion.button>
              <motion.button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="material-icons">view_list</span>
              </motion.button>
            </div>
            
            <select 
              className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_high">Price: High to Low</option>
              <option value="price_low">Price: Low to High</option>
            </select>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {activeTab === 'Following' && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Creators You Follow</h3>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <span className="material-icons mr-2">person_add</span>
                    Find More Creators
                  </motion.button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {followedCreators.map((creatorName, index) => {
                    const creator = posts.find(post => post.creator.name === creatorName)?.creator;
                    if (!creator) return null;
                    
                    return (
                      <motion.div
                        key={`creator-${index}`}
                        className="bg-gray-800 rounded-lg p-4 flex items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                          <img 
                            src={creator.avatar} 
                            alt={creator.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{creator.name}</h4>
                          <p className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${getCreatorTypeColor(creator.type)}`}>
                            {creator.type}
                          </p>
                          <div className="flex mt-2">
                            <Link href={`/artist/${creator.name.replace('@', '')}`}>
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="bg-blue-500 bg-opacity-20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold mr-2"
                              >
                                View Profile
                              </motion.button>
                            </Link>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-semibold"
                            >
                              Unfollow
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="mb-8 bg-[#1A1A1A] p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-6">
                {activeTab === 'Home' && 'Explore Artworks'}
                {activeTab === 'Following' && 'Latest From Your Network'}
                {activeTab === 'Trending' && 'Trending Artworks'}
                {activeCategory !== 'all' && ` in ${categories.find(c => c.id === activeCategory)?.name}`}
              </h3>
              
              {/* Gallery View Component */}
              <GalleryView 
                artworks={artworks.map(artwork => ({
                  ...artwork,
                  thumbnailUrl: artwork.thumbnailUrl || artwork.image || 'https://via.placeholder.com/300',
                  price: artwork.price || '0.00',
                  isForSale: artwork.isForSale || false,
                  saleStatus: artwork.saleStatus || 'unavailable',
                  createdAt: artwork.createdAt || new Date().toLocaleDateString(),
                  creator: {
                    id: artwork.creator?.id || 0,
                    name: artwork.creator?.name || 'Unknown Artist',
                    address: artwork.creator?.address || '',
                    profileImage: artwork.creator?.avatar || artwork.creator?.profileImage,
                    artistType: artwork.creator?.type || artwork.creator?.artistType
                  }
                }))}
                loading={loading}
                viewMode={viewMode}
                activeTab={activeTab}
                activeCategory={activeCategory}
                getCreatorTypeStyle={getCreatorTypeStyle}
                getCategoryStyle={getCategoryStyle}
              />
              
              {!loading && artworks.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium text-gray-300">No artworks found</h3>
                  <p className="text-gray-500 mt-2">
                    {activeTab === 'Following' 
                      ? 'Follow some artists to see their work here.' 
                      : activeCategory !== 'all' 
                      ? `No artworks found in the ${categories.find(c => c.id === activeCategory)?.name} category.` 
                      : 'No artworks available at the moment.'}
                  </p>
                  <Link href="/publish">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg flex items-center mx-auto"
                    >
                      <span className="material-icons mr-2">add</span>
                      Publish Your Artwork
                    </motion.button>
                  </Link>
                </div>
              )}
            </div>
            
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;