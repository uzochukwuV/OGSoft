'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletContext } from '@/context/WalletContext';
import { userTypeEnum } from '@/lib/db/schema';

interface ProfileUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstTimeUser?: boolean;
}

interface UserProfile {
  id?: number;
  address: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  userType?: string;
}

export default function ProfileUpdateModal({ 
  isOpen, 
  onClose, 
  isFirstTimeUser = false 
}: ProfileUpdateModalProps) {
  const { address } = useWalletContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [profile, setProfile] = useState<UserProfile>({
    address: '',
    username: '',
    displayName: '',
    bio: '',
    avatarUrl: '',
    coverUrl: '',
    userType: 'collector'
  });
  
  // File upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Fetch user profile from database
  useEffect(() => {
    if (!address) return;
    
    // Update address in profile state
    setProfile(prev => ({ ...prev, address }));
    
    // If not first time user, fetch existing profile
    if (!isFirstTimeUser) {
      fetchUserProfile(address);
    } else {
      // For first time users, set a default username based on address
      setProfile(prev => ({
        ...prev,
        username: 'User' + address.slice(2, 6)
      }));
    }
  }, [address, isFirstTimeUser]);
  
  // Fetch user profile from API
  const fetchUserProfile = async (walletAddress: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/user?address=${walletAddress}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // User not found, treat as first time user
          setProfile(prev => ({
            ...prev,
            username: 'User' + walletAddress.slice(2, 6)
          }));
          return;
        }
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile({
        address: data.user.address,
        username: data.user.username,
        displayName: data.user.displayName || '',
        bio: data.user.bio || '',
        avatarUrl: data.user.avatarUrl || '',
        coverUrl: data.user.coverUrl || '',
        userType: data.user.userType || 'collector'
      });
      
      // Set avatar preview if available
      if (data.user.avatarUrl) {
        setAvatarPreview(data.user.avatarUrl);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }
    
    const file = e.target.files[0];
    setAvatarFile(file);
    
    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    
    // We'll handle the actual upload when the form is submitted
  };
  
  // Upload avatar to a storage service (in a real app, you'd use a cloud storage service)
  const uploadAvatar = async (file: File): Promise<string> => {
    // This is a placeholder - in a real app, you would upload to a service like S3, Firebase Storage, etc.
    // For now, we'll just return a data URL as a demonstration
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Submit form to create or update user profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      // Validate required fields
      if (!profile.username) {
        setError('Username is required');
        return;
      }
      
      // Upload avatar if selected
      let avatarUrl = profile.avatarUrl;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }
      
      // Prepare data for API
      const userData = {
        ...profile,
        avatarUrl
      };
      
      // Determine if we're creating or updating
      const method = isFirstTimeUser ? 'POST' : 'PUT';
      const response = await fetch('/api/user', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save profile');
      }
      
      setSuccess(true);
      
      // Close modal after a brief delay to show success state
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  // Skip profile creation but still save basic info
  const handleSkip = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      
      // Create a minimal profile
      const minimalProfile = {
        address,
        username: profile.username || `User${address.slice(2, 6)}`,
        userType: 'collector'
      };
      
      await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(minimalProfile),
      });
      
      onClose();
    } catch (err) {
      console.error('Error creating minimal profile:', err);
      // Still close the modal even if there's an error
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {isFirstTimeUser ? '🎉 Welcome! Set up your profile' : '✏️ Update your profile'}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {isFirstTimeUser ? 'Let\'s create your digital identity' : 'Keep your profile up to date'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                >
                  ⚠️ {error}
                </motion.div>
              )}

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
                >
                  ✅ Profile saved successfully!
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      {avatarPreview || profile.avatarUrl ? (
                        <img
                          src={avatarPreview || profile.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-2xl font-bold">
                          {profile.username ? profile.username[0].toUpperCase() : '👤'}
                        </span>
                      )}
                    </div>
                    <label
                      htmlFor="avatar"
                      className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer transition-colors shadow-lg"
                    >
                      📷
                      <input
                        type="file"
                        id="avatar"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 text-center">Click the camera to upload your avatar</p>
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={profile.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                    placeholder="Enter your username"
                    required
                  />
                </div>

                {/* Display Name */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={profile.displayName || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                    placeholder="Your display name"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profile.bio || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* User Type */}
                <div>
                  <label htmlFor="userType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    I am a...
                  </label>
                  <select
                    id="userType"
                    name="userType"
                    value={profile.userType || 'collector'}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                  >
                    <option value="collector">🎨 Collector</option>
                    <option value="creator">🚀 Creator</option>
                    <option value="both">💎 Both Creator & Collector</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-6">
                  {isFirstTimeUser && (
                    <motion.button
                      type="button"
                      onClick={handleSkip}
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-3 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Skip for now
                    </motion.button>
                  )}
                  <motion.button
                    type="submit"
                    disabled={loading || !profile.username}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{isFirstTimeUser ? '🎉 Create Profile' : '💾 Update Profile'}</span>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}