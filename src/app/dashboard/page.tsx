'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import WalletDropdown from '@/components/WalletDropdown';

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

  useEffect(() => {
    setMounted(true);
  }, []);

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
        
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="category-filters flex flex-wrap gap-2 mb-8"
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

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ staggerChildren: 0.1 }}
          >
             {activeTab === 'Following' ? (
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
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-blue-500 bg-opacity-20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold mr-2"
                          >
                            View Profile
                          </motion.button>
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
              
              <h3 className="text-xl font-bold mb-4">Latest From Your Network</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts
                  .filter(post => followedCreators.includes(post.creator.name))
                  .slice(0, 4)
                  .map((post, index) => (
                    <motion.div
                      key={`following-${post.id}`}
                      className={`bg-gray-800 rounded-lg overflow-hidden shadow-md border-l-2 ${getCategoryBorderColor(post.category)}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <div className="flex h-40">
                        <div className="w-1/3 overflow-hidden relative">
                          <img 
                            src={post.image} 
                            alt={post.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-2/3 p-4 flex flex-col">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                              <img 
                                src={post.creator.avatar} 
                                alt={post.creator.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-sm text-gray-300">{post.creator.name}</span>
                            <span className="text-xs text-gray-500 ml-2">• 2h ago</span>
                          </div>
                          <h4 className="font-bold text-sm mb-2">{post.title}</h4>
                          <p className="text-xs text-gray-400 line-clamp-2 mb-2">{post.description}</p>
                          <div className="flex justify-between text-xs text-gray-400 mt-auto">
                            <div className="flex items-center">
                              <span className="material-icons text-xs mr-1">favorite</span>
                              {post.likes}
                            </div>
                            <div className="flex items-center">
                              <span className="material-icons text-xs mr-1">chat_bubble</span>
                              {post.comments}
                            </div>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-blue-400 flex items-center"
                            >
                              <span className="material-icons text-xs mr-1">bookmark_border</span>
                              Save
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          ) : activeTab === 'Trending' ? (
            <div className="mb-8 bg-[#1A1A1A] p-6 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Trending Content</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Sort by:</span>
                  <select className="bg-gray-800 text-white text-sm rounded-lg px-3 py-1 border border-gray-700">
                    <option>Most Popular</option>
                    <option>Newest</option>
                    <option>Most Engagement</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {posts
                  .filter(post => activeCategory === 'all' || post.category === activeCategory)
                  .sort((a, b) => parseInt(b.likes.replace('k', '000')) - parseInt(a.likes.replace('k', '000')))
                  .slice(0, 6)
                  .map((post, index) => (
                  <motion.div
                    key={`trending-${post.id}`}
                    className={`bg-gray-800 rounded-lg overflow-hidden shadow-md border-l-2 ${getCategoryBorderColor(post.category)}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="h-40 overflow-hidden relative">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryBadgeColor(post.category)}`}>
                          {post.category}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-16"></div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-sm mb-2 truncate">{post.title}</h4>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                            <img 
                              src={post.creator.avatar} 
                              alt={post.creator.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-xs text-gray-400">{post.creator.name}</span>
                        </div>
                        {post.price && <span className="text-xs text-green-400">{post.price}</span>}
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <div className="flex items-center">
                          <span className="material-icons text-xs mr-1">favorite</span>
                          {post.likes}
                        </div>
                        <div className="flex items-center">
                          <span className="material-icons text-xs mr-1">chat_bubble</span>
                          {post.comments}
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-blue-400 flex items-center"
                        >
                          <span className="material-icons text-xs mr-1">bookmark_border</span>
                          Save
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) :
            
             
            (  <div className="mb-8 bg-[#1A1A1A] p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4">Trending in {activeCategory === 'all' ? 'All Content' : categories.find(c => c.id === activeCategory)?.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {posts
                    .filter(post => activeCategory === 'all' || post.category === activeCategory)
                    .slice(0, 3)
                    .map((post, index) => (
                      <motion.div
                        key={`trending-${post.id}`}
                        className={`bg-gray-800 rounded-lg overflow-hidden shadow-md border-l-2 ${getCategoryBorderColor(post.category)}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="h-32 overflow-hidden relative">
                          <img 
                            src={post.image} 
                            alt={post.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryBadgeColor(post.category)}`}>
                              {post.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-bold text-sm mb-1 truncate">{post.title}</h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                                <img 
                                  src={post.creator.avatar} 
                                  alt={post.creator.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-xs text-gray-400">{post.creator.name}</span>
                            </div>
                            {post.price && <span className="text-xs text-green-400">{post.price}</span>}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              
              {posts
                .filter(post => activeCategory === 'all' || post.category === activeCategory)
                .map((post) => (
              <motion.div
                key={post.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`flex ${post.isReversed ? 'flex-row-reverse' : 'flex-row'} bg-[#1A1A1A] rounded-2xl mb-8 overflow-hidden p-6 gap-6 border-l-4 ${getCategoryBorderColor(post.category)}`}
              >
                <div className="w-1/2 relative">
                  <div className="relative w-full h-full min-h-[300px] rounded-lg overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className={`absolute top-3 left-3 bg-black bg-opacity-50 backdrop-blur-sm px-3 py-1 rounded-full flex items-center text-xs`}>
                    <span className={`material-icons text-sm mr-1 text-${post.badge.color}-400`}>{post.badge.icon}</span>
                    {post.badge.text}
                  </div>
                  
                  {post.status && (
                    <div className={`absolute bottom-3 ${post.isReversed ? 'right-3' : 'left-3'} bg-gray-900 bg-opacity-70 p-2 rounded-lg flex items-center space-x-2`}>
                      {!post.isReversed ? (
                        <>
                          <div className={`w-4 h-4 bg-${post.status.color}-500 rounded-full animate-pulse`}></div>
                          <span className="text-xs text-gray-300">{post.status.text}</span>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold mb-1 text-xs">INFT Status</p>
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                            <span className="text-gray-400 ml-1 text-xs">{post.status.text}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="w-1/2 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <motion.h3 
                      className="text-2xl font-bold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {post.title}
                    </motion.h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryBadgeColor(post.category)}`}>
                       {post.category}
                     </span>
                  </div>
                  
                  <motion.p 
                    className="text-gray-400 mb-4 flex-grow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {post.description}
                  </motion.p>
                  
                  {post.price && (
                    <div className="flex items-center space-x-2 text-sm mb-4">
                      <span className="material-icons text-sm text-green-400">paid</span>
                      <span className="text-green-400 font-semibold">{post.price}</span>
                      <span className="text-gray-500">·</span>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-green-500 bg-opacity-20 text-green-300 px-3 py-1 rounded-full text-xs font-semibold hover:bg-opacity-30"
                      >
                        Tip Creator
                      </motion.button>
                    </div>
                  )}
                  
                  {post.performance && (
                    <motion.div 
                      className="bg-gray-800 p-3 rounded-lg mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <p className="text-xs text-gray-400 mb-2">Cross-platform performance</p>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center"><span className="material-icons text-lg text-pink-400 mr-1">camera_alt</span> {post.performance.instagram}</div>
                        <div className="flex items-center"><span className="material-icons text-lg text-red-400 mr-1">play_circle</span> {post.performance.youtube}</div>
                        <div className="flex items-center"><span className="material-icons text-lg text-blue-400 mr-1">flutter_dash</span> {post.performance.twitter}</div>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <motion.button 
                          whileHover={{ backgroundColor: '#4B5563' }}
                          className="text-xs bg-gray-700 px-3 py-1 rounded-full"
                        >
                          Optimize for Instagram
                        </motion.button>
                        <motion.button 
                          whileHover={{ backgroundColor: '#4B5563' }}
                          className="text-xs bg-gray-700 px-3 py-1 rounded-full"
                        >
                          Optimize for TikTok
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full mr-3 overflow-hidden">
                      <img 
                        src={post.creator.avatar} 
                        alt={`${post.creator.name}'s avatar`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-white font-semibold">By {post.creator.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {post.creator.type && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getCreatorTypeColor(post.creator.type)}`}>
                            {post.creator.type}
                          </span>
                        )}
                        {post.socials && post.socials.map((social, idx) => (
                          <span 
                            key={idx}
                            className={`material-icons text-lg ${getSocialIconColor(social)}`} 
                            title={`Shared on ${social.charAt(0).toUpperCase() + social.slice(1)}`}
                          >
                            {getSocialIcon(social)}
                          </span>
                        ))}
                      </div>
                    </div>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-400">
                      <motion.span 
                        className="flex items-center cursor-pointer"
                        whileHover={{ color: '#F87171' }}
                      >
                        <span className="material-icons mr-1">favorite_border</span> {post.likes}
                      </motion.span>
                      <motion.span 
                        className="flex items-center cursor-pointer"
                        whileHover={{ color: '#60A5FA' }}
                      >
                        <span className="material-icons mr-1">chat_bubble_outline</span> {post.comments}
                      </motion.span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            </div>)}
            
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;