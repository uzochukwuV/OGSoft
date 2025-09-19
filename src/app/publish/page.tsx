'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { useFees } from '@/hooks/useFees';
import { useUpload } from '@/hooks/useUpload';
import { useNetwork } from '../providers';
import { useWallet } from '@/hooks/useWallet';
import { FileInfo } from '@/types';

const Publish = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [contentType, setContentType] = useState('AI Art');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);


  // Network and wallet state management
  const { networkType } = useNetwork();
  const { address, isConnected } = useWallet();
  
  // File state
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  
  // Custom hooks
  const { 
    feeInfo, 
    error: feeError, 
    rootHash, 
    submission, 
    flowContract, 
    calculateFeesForFile, 
    getCurrentNetwork,
    blob
  } = useFees();
  
  const {
    loading: uploadLoading,
    error: uploadError,
    uploadStatus,
    txHash,
    uploadFile,
    resetUploadState,
    getExplorerUrl
  } = useUpload();
  
  // Create a key for forcing component remount on network change
  const networkKey = networkType;
  
  // Handle file drop
  const handleFileDrop = (file: File) => {
    // Reset transaction state when a new file is selected
    if (txHash) {
      console.log('Resetting upload state - txHash exists:', txHash);
      resetUploadState();
    }
    
    // Set the new file info
    setFileInfo({
      name: file.name,
      size: file.size
    });
    
    // Set the selected file for preview
    setSelectedFile(file);
    
    // Calculate fees for the file if wallet is connected
    calculateFeesForFile(file, isConnected);
  };
  
  // Handle clear file selection
  const handleClearFile = () => {
    setFileInfo(null);
    resetUploadState();
  };
  
  // Handle retry fee calculation
  const handleRetryFeeCalculation = () => {
    if (fileInfo) {
      const input = document.createElement('input');
      input.type = 'file';
      
      input.onchange = (e: Event) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          handleFileDrop(files[0]);
        }
      };
      
      input.click();
    }
  };
  
  // Handle upload click
  const handleUpload = async () => {
    if (!blob || !submission || !flowContract || !feeInfo) return;
    
    // Upload the file and get the transaction hash
    await uploadFile(blob, submission, flowContract, feeInfo.rawTotalFee);
  };
  
  // Reset state when network changes
  useEffect(() => {
    setFileInfo(null);
  }, [networkType]);
  
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    price: '',
    tags: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    // Free memory when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  if (!mounted) return null;

  const contentTypes = [
    { id: 'ai-art', name: 'AI Art', icon: 'auto_awesome' },
    { id: 'comics', name: 'Comics', icon: 'auto_stories' },
    { id: 'traditional-art', name: 'Traditional Art', icon: 'palette' },
    { id: 'photography', name: 'Photography', icon: 'photo_camera' },
    { id: 'brand', name: 'Fashion', icon: 'shopping_bag' },
    { id: 'education', name: 'Education', icon: 'school' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      return;
    }
    setSelectedFile(e.target.files[0]);
  };

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMetadata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePublish = async () => {
    if (!selectedFile || !metadata.title || !isConnected) return;
    
    // Check if we have the required blockchain data
    if (!blob || !submission || !flowContract || !feeInfo || !rootHash) {
      alert('Please wait for fee calculation to complete');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Start progress animation
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);

      // Upload the file to blockchain
      const hash = await uploadFile(blob, submission, flowContract, feeInfo.rawTotalFee);
      
      if (!hash) {
        throw new Error('Upload failed');
      }
      
      // Complete the progress
      clearInterval(interval);
      setUploadProgress(100);
      
      // Save to database
      const contentType = selectedFile.type.startsWith('image/') ? 'image' : 
                         selectedFile.type.startsWith('video/') ? 'video' : 
                         selectedFile.type.startsWith('audio/') ? 'audio' : 'document';
      
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: metadata.title,
          description: metadata.description,
          price: metadata.price,
          contentType,
          rootHash,
          txHash: hash,
          networkType,
          creatorAddress: address,
          fileSize: selectedFile.size,
          fileName: selectedFile.name,
          mimeType: selectedFile.type,
          // Extract tags and find category ID based on content type selection
          tags: metadata.tags,
          categoryId: contentTypes.find(type => type.name === contentType)?.id
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save content to database');
      }
      
      // Show success message with transaction link
      const explorerUrl = getExplorerUrl(hash);
      alert(`Content published successfully!\nTransaction: ${hash}\nView on explorer: ${explorerUrl}`);
      
      // Reset form
      setIsUploading(false);
      setSelectedFile(null);
      setFileInfo(null);
      resetUploadState();
      setMetadata({
        title: '',
        description: '',
        price: '',
        tags: ''
      });
    } catch (error) {
      console.error('Publish error:', error);
      alert(`Failed to publish: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Navbar activeLink="Publish" />
      
      <main className="ml-64 flex-1 p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">Publish Content</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Upload & Preview */}
            <div className="bg-[#1A1A1A] p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Upload Content</h2>
              
              {!selectedFile ? (
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <span className="material-icons text-5xl mb-4 text-gray-400">cloud_upload</span>
                  <p className="text-gray-300 mb-2">Drag and drop your file here or click to browse</p>
                  <p className="text-gray-500 text-sm">Supports images, videos, 3D models, and documents</p>
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileDrop(e.target.files[0]);
                      }
                    }} 
                    accept="image/*,video/*,.glb,.gltf,.pdf"
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
                    {selectedFile.type.startsWith('image/') && (
                      <img 
                        src={preview || ''} 
                        alt="Preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                    {selectedFile.type.startsWith('video/') && (
                      <video 
                        src={preview || ''} 
                        controls 
                        className="max-w-full max-h-full"
                      />
                    )}
                    {!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/') && (
                      <div className="text-center p-4">
                        <span className="material-icons text-4xl mb-2">
                          {selectedFile.type.includes('pdf') ? 'picture_as_pdf' : 'insert_drive_file'}
                        </span>
                        <p className="text-sm">{selectedFile.name}</p>
                      </div>
                    )}
                  </div>
                  <button 
                    className="absolute top-2 right-2 bg-gray-800 rounded-full p-1 hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      setSelectedFile(null);
                      handleClearFile();
                    }}
                  >
                    <span className="material-icons text-white">close</span>
                  </button>
                </div>
              )}
              
              {/* Fee Information Section */}
              {selectedFile && isConnected && (
                <div className="mt-4 bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-2">Storage Fee Information</h4>
                  
                  {feeError ? (
                    <div className="text-red-400 mb-2">
                      <p>Error calculating fees: {feeError}</p>
                      <button 
                        onClick={handleRetryFeeCalculation}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  ) : feeInfo.isLoading ? (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                      <span>Calculating fees...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Storage Fee:</span>
                        <span className="text-white">{feeInfo.storageFee} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Estimated Gas:</span>
                        <span className="text-white">{feeInfo.estimatedGas} ETH</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-300">Total Fee:</span>
                        <span className="text-white">{feeInfo.totalFee} ETH</span>
                      </div>
                      
                      {rootHash && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <div className="flex justify-between items-start">
                            <span className="text-gray-400">Root Hash:</span>
                            <span className="text-gray-300 text-xs break-all max-w-[200px]">{rootHash}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Content Type</h3>
                <div className="flex flex-wrap gap-2">
                  {contentTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      onClick={() => setContentType(type.name)}
                      className={`px-3 py-2 rounded-full flex items-center ${contentType === type.name ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="material-icons mr-1 text-sm">{type.icon}</span>
                      {type.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Column - Metadata */}
            <div className="bg-[#1A1A1A] p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Content Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1">Title</label>
                  <input 
                    type="text" 
                    name="title"
                    value={metadata.title}
                    onChange={handleMetadataChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter a title for your content"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">Description</label>
                  <textarea 
                    name="description"
                    value={metadata.description}
                    onChange={handleMetadataChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors min-h-[100px]"
                    placeholder="Describe your content..."
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">Price (USD)</label>
                  <input 
                    type="text" 
                    name="price"
                    value={metadata.price}
                    onChange={handleMetadataChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">Tags</label>
                  <input 
                    type="text" 
                    name="tags"
                    value={metadata.tags}
                    onChange={handleMetadataChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Separate tags with commas"
                  />
                </div>
                
                {/* Fee Information */}
              {fileInfo && isConnected && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Storage Fee Information</h3>
                  
                  {feeError ? (
                    <div className="text-red-400 mb-2">
                      <p>{feeError}</p>
                      <button 
                        onClick={handleRetryFeeCalculation}
                        className="mt-2 px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Retry Calculation
                      </button>
                    </div>
                  ) : feeInfo.isLoading ? (
                    <div className="flex items-center text-gray-300">
                      <span className="material-icons animate-spin mr-2">sync</span>
                      Calculating storage fees...
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Storage Fee:</span>
                        <span className="text-white">{feeInfo.storageFee} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Estimated Gas:</span>
                        <span className="text-white">{feeInfo.estimatedGas} ETH</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-300">Total Fee:</span>
                        <span className="text-white">{feeInfo.totalFee} ETH</span>
                      </div>
                      
                      {rootHash && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <div className="flex justify-between items-start">
                            <span className="text-gray-400">Root Hash:</span>
                            <span className="text-gray-300 text-xs break-all max-w-[200px]">{rootHash}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Upload Status */}
              {uploadStatus && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Upload Status</h3>
                  <div className="text-gray-300">
                    <p>{uploadStatus}</p>
                    {txHash && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <p className="text-sm text-gray-400 mb-1">Transaction Hash:</p>
                        <p className="text-xs break-all">{txHash}</p>
                        <a 
                          href={getExplorerUrl(txHash)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View on Explorer
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <motion.button
                  onClick={handlePublish}
                  disabled={isUploading || !selectedFile || !metadata.title || !isConnected || feeInfo.isLoading || !!feeError || uploadLoading}
                  className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center ${(!selectedFile || !metadata.title || !isConnected || feeInfo.isLoading || !!feeError || uploadLoading) ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  whileHover={!isUploading && !uploadLoading && selectedFile && metadata.title && isConnected && !feeInfo.isLoading && !feeError ? { scale: 1.02 } : {}}
                  whileTap={!isUploading && !uploadLoading && selectedFile && metadata.title && isConnected && !feeInfo.isLoading && !feeError ? { scale: 0.98 } : {}}
                >
                  {isUploading ? (
                    <>
                      <span className="material-icons animate-spin mr-2">sync</span>
                      {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Confirming Transaction...'}
                    </>
                  ) : uploadLoading ? (
                    <>
                      <span className="material-icons animate-spin mr-2">sync</span>
                      Processing Transaction...
                    </>
                  ) : !isConnected ? (
                    <>
                      <span className="material-icons mr-2">account_balance_wallet</span>
                      Connect Wallet to Publish
                    </>
                  ) : feeInfo.isLoading ? (
                    <>
                      <span className="material-icons animate-spin mr-2">sync</span>
                      Calculating Fees...
                    </>
                  ) : !!feeError ? (
                    <>
                      <span className="material-icons mr-2">error</span>
                      Fee Calculation Failed
                    </>
                  ) : (
                    <>
                      <span className="material-icons mr-2">publish</span>
                      Publish to Blockchain
                    </>
                  )}
                </motion.button>
                  
                  {isUploading && (
                    <div className="mt-4">
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-500"
                          initial={{ width: '0%' }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Uploading to IPFS</span>
                        <span>{uploadProgress}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-[#1A1A1A] p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Blockchain Storage Information</h2>
            <p className="text-gray-300 mb-4">
              Your content will be stored on IPFS (InterPlanetary File System) and its reference (CID) will be recorded on the blockchain. This ensures your content is:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <span className="material-icons text-blue-500 text-2xl mb-2">lock</span>
                <h3 className="font-medium mb-1">Immutable</h3>
                <p className="text-gray-400 text-sm">Once published, your content cannot be altered or deleted.</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <span className="material-icons text-green-500 text-2xl mb-2">verified_user</span>
                <h3 className="font-medium mb-1">Verifiable</h3>
                <p className="text-gray-400 text-sm">Anyone can verify you are the original creator of this content.</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <span className="material-icons text-purple-500 text-2xl mb-2">account_balance_wallet</span>
                <h3 className="font-medium mb-1">Monetizable</h3>
                <p className="text-gray-400 text-sm">Earn directly from your content through sales and tips.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Publish;