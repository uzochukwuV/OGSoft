import { useCallback } from 'react';
import { useNetwork } from '@/app/providers';
import { useWallet } from '@/hooks/useWallet';
import { SocialManager } from '@/lib/social/social-manager';
import { SocialContent } from '@/lib/social/types';

export function useSocial() {
  const { networkType } = useNetwork();
  const { address } = useWallet();

  const createPost = useCallback(
    async (opts: { text?: string; mediaFiles?: File[] }) : Promise<SocialContent> => {
      if (!address) throw new Error('Connect wallet first');

      const mgr = new SocialManager(networkType);
      let mediaRootHashes: string[] = [];

      if (opts.mediaFiles?.length) {
        mediaRootHashes = await mgr.uploadMediaFiles(opts.mediaFiles);
      }

      return mgr.createPost(
        { text: opts.text, mediaRootHashes },
        address
      );
    },
    [networkType, address]
  );

  return { createPost };
}