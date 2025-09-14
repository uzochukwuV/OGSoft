'use client';

import React, { useState } from 'react';
import { useNetwork } from '@/app/providers';
import { useWallet } from '@/hooks/useWallet';
import { useSocial } from '@/hooks/useSocial';
import { useSocialFeedContext } from '@/context/SocialContext';

type LocalMedia = { file: File; preview: string };

export default function SocialUploadCard() {
  const { networkType } = useNetwork();
  const { isConnected, directWalletAddress, forceReconnectWallet } = useWallet();
  const { createPost } = useSocial();
  const { addPost } = useSocialFeedContext();

  const [text, setText] = useState('');
  const [media, setMedia] = useState<LocalMedia[]>([]);
  const [posting, setPosting] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [postHash, setPostHash] = useState<string>('');

  const onFilesSelected = (files: FileList | null) => {
    if (!files || !files.length) return;
    const items: LocalMedia[] = [];
    for (const f of Array.from(files)) {
      items.push({ file: f, preview: URL.createObjectURL(f) });
    }
    setMedia(prev => [...prev, ...items]);
  };

  const removeMedia = (idx: number) => {
    setMedia(prev => {
      const copy = [...prev];
      const removed = copy.splice(idx, 1);
      if (removed.length && removed[0].preview) URL.revokeObjectURL(removed[0].preview);
      return copy;
    });
  };

  const handlePost = async () => {
    setError('');
    setStatus('Preparing...');
    setPosting(true);
    setPostHash('');

    try {
      if (!isConnected) {
        forceReconnectWallet();
        throw new Error('Please connect your wallet');
      }

      setStatus('Uploading media to 0G...');
      const content = await createPost({
        text,
        mediaFiles: media.map(m => m.file),
      });

      // Update local feed
      addPost(content);

      setStatus('Post stored on 0G');
      if (content.storageHash) setPostHash(content.storageHash);
      setText('');
      setMedia([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus('');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
        <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
          networkType === 'standard' ? 'bg-[#FFDCD4] text-gray-800' : 'bg-[#CAF0FC] text-gray-800'
        }`}>
          {networkType.charAt(0).toUpperCase() + networkType.slice(1)} Mode
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share something with your audience..."
          className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />

        {/* Media picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Add Media</label>
          <input
            type="file"
            multiple
            onChange={(e) => onFilesSelected(e.target.files)}
            className="block w-full text-sm text-gray-900
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
          />
        </div>

        {/* Previews */}
        {media.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {media.map((m, idx) => (
              <div key={idx} className="relative group">
                <img src={m.preview} alt="" className="h-24 w-full object-cover rounded-md border" />
                <button
                  onClick={() => removeMedia(idx)}
                  className="absolute top-1 right-1 bg-white/80 hover:bg-white text-gray-700 rounded-full p-1 shadow hidden group-hover:block"
                  title="Remove"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handlePost}
          disabled={posting || (!text && media.length === 0)}
          className={`mt-2 w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center
            ${posting || (!text && media.length === 0) ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}
        >
          {posting ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              Posting...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25h9m-9 3.75h9m-9 3.75h9M3 6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25V6.75z" />
              </svg>
              Post
            </>
          )}
        </button>

        {/* Status */}
        {status && (
          <div className="mt-3 p-3 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-sm">
            {status}
          </div>
        )}
        {error && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 border border-red-100 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Post storage hash */}
        {postHash && (
          <div className="mt-3 p-3 bg-green-50 text-green-700 border border-green-100 rounded-md text-sm break-all">
            Stored on 0G with root hash: {postHash}
          </div>
        )}
      </div>
    </div>
  );
}