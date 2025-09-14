'use client';

import React from 'react';
import { useSocialFeedContext } from '@/context/SocialContext';
import { truncateString } from '@/utils/format';

export default function SocialFeed() {
  const { posts } = useSocialFeedContext();

  if (!posts.length) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-gray-600">
        No posts yet. Create one above.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(p => (
        <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-xs text-gray-500 mb-1">
            {new Date(p.createdAt).toLocaleString()}
          </div>
          {p.content.text && <p className="text-gray-900 mb-3 whitespace-pre-wrap">{p.content.text}</p>}
          {p.content.media?.length ? (
            <div className="grid grid-cols-3 gap-2">
              {p.content.media.map((m, i) => (
                <div key={i} className="text-xs text-gray-600 break-all bg-gray-50 rounded p-2">
                  Media root: {truncateString(m.rootHash, 10, 10)}
                </div>
              ))}
            </div>
          ) : null}
          {p.storageHash && (
            <div className="mt-3 text-xs text-green-700 bg-green-50 border border-green-100 rounded p-2 break-all">
              Metadata root: {truncateString(p.storageHash, 10, 10)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}