export type TokenAmount = {
  token: string; // symbol or address
  amount: string; // human readable
};

export type MediaItem = {
  rootHash: string;
  type: 'image' | 'video' | 'other';
};

export interface SocialContent {
  id: string;
  creator: string;
  type: 'post';
  content: {
    text?: string;
    media: MediaItem[];
  };
  engagement: {
    likes: number;
    comments: number;
  };
  createdAt: number;
  storageHash?: string;
  blockchainTx?: string;
}

export interface CreatePostRequest {
  text?: string;
  mediaRootHashes?: string[];
}

export interface CreatorProfile {
  id: string;
  walletAddress: string;
  username: string;
  displayName: string;
  bio: string;
  avatar?: string; // 0G root hash
  coverImage?: string; // 0G root hash
  followerCount: number;
  followingCount: number;
  verificationStatus: 'none' | 'verified' | 'premium';
  createdAt: number;
  updatedAt: number;
}