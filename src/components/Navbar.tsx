'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface NavLink {
  name: string;
  icon: string;
}

interface SidebarCategory {
  category: string;
  links: NavLink[];
}

interface NavbarProps {
  activeLink?: string;
}

const Navbar = ({ activeLink = 'Home' }: NavbarProps) => {
  const sidebarLinks: SidebarCategory[] = [
    { category: 'Feed', links: [
      { name: 'Home', icon: 'home' },
      { name: 'Following', icon: 'people' },
      { name: 'Trending', icon: 'trending_up' }
    ]},
    { category: 'Create', links: [
      { name: 'AI Studio', icon: 'auto_awesome' },
      { name: 'AI Assistant', icon: 'auto_fix_high' },
      { name: 'Collaborate', icon: 'people_outline' },
      { name: 'Publish', icon: 'publish' }
    ]},
    { category: 'Economy', links: [
      { name: 'Earnings', icon: 'attach_money' },
      { name: 'NFTs', icon: 'token' },
      { name: 'Marketplace', icon: 'store' }
    ]},
    { category: 'Community', links: [
      { name: 'Messages', icon: 'message' },
      { name: 'Groups', icon: 'group' },
      { name: 'Events', icon: 'event' }
    ]}
  ];

  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed w-64 h-screen bg-[#1A1A1A] p-6 flex flex-col"
    >
      <div className="flex items-center mb-14 mt-8">
        <span className="material-icons text-3xl text-blue-500 mr-2 w-[45px]">neurology</span>
        <h1 className="text-xl font-bold text-white">Neural Creator</h1>
      </div>

      <nav className="flex flex-col space-y-2 flex-grow">
        {sidebarLinks.map((category, idx) => (
          <div key={idx} className="mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{category.category}</p>
            {category.links.map((link, linkIdx) => (
              <motion.a
                key={linkIdx}
                href={link.name === 'Publish' ? '/publish' : link.name === 'Home' ? '/dashboard' : '#'}
                whileHover={{ backgroundColor: '#2a2a2a', color: '#FFFFFF' }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center p-3 rounded-lg font-medium transition-colors ${link.name === activeLink ? 'bg-blue-500 text-white' : 'text-[#A0A0A0]'}`}
              >
                <span className="material-icons mr-4">{link.icon}</span>
                {link.name}
              </motion.a>
            ))}
          </div>
        ))}
      </nav>

      <motion.div 
        whileHover={{ scale: 1.03 }}
        className="bg-[#252525] rounded-xl p-4 text-center mt-auto"
      >
        <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-gray-700 overflow-hidden">
          <img 
            alt="AI Assistant avatar" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlujsFGgg5K7ZDBBW_8_i5XnFkC9ogOhz9swaPiUVdMCZVmSS4FgupbOL_dTLY0leQw6oUIJDmbjm3-OUa_TgghIDELSxGGCO4oNvuzmjQR74DbEdd6UVOJ7NE4v2ruGTd5P27aFoyjp_cXB7-GMuqdQU3nzIpx3rA8bq_i0_x41NChaog0lkULL1_7A4k41Ze9La7azDVp-J52Hd6XvuNxMWNy-hNEC1FzlUhz9IQlQyoG8F9Z_Kw2jPLfgqyrRKfnV3tOxGfAPI"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-sm text-gray-400 mb-4">How can I help you create today?</p>
        <motion.button 
          whileHover={{ backgroundColor: '#0084e3' }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold"
        >
          Get Started
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Navbar;