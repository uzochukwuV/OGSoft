import { db, schema } from '.';
import { eq, and, desc, sql } from 'drizzle-orm';

/**
 * Database utility functions
 * 
 * This file provides helper functions for common database operations
 * related to users, content, and social interactions.
 */

// User-related functions
export const userUtils = {
  /**
   * Get a user by their wallet address
   */
  getUserByAddress: async (address: string) => {
    return await db.query.users.findFirst({
      where: eq(schema.users.address, address),
    });
  },

  /**
   * Get a user's social links
   */
  getUserSocials: async (userId: number) => {
    return await db.query.userSocials.findMany({
      where: eq(schema.userSocials.userId, userId),
    });
  },

  /**
   * Get users followed by a specific user
   */
  getFollowing: async (userId: number) => {
    const follows = await db
      .select()
      .from(schema.userFollows)
      .innerJoin(schema.users, eq(schema.userFollows.followingId, schema.users.id))
      .where(eq(schema.userFollows.followerId, userId));
    
    return follows.map(f => f.users);
  },

  /**
   * Get users who follow a specific user
   */
  getFollowers: async (userId: number) => {
    const followers = await db
      .select()
      .from(schema.userFollows)
      .innerJoin(schema.users, eq(schema.userFollows.followerId, schema.users.id))
      .where(eq(schema.userFollows.followingId, userId));
    
    return followers.map(f => f.users);
  },
};

// Content-related functions
export const contentUtils = {
  /**
   * Get content by root hash
   */
  getContentByRootHash: async (rootHash: string) => {
    return await db.query.contents.findFirst({
      where: eq(schema.contents.rootHash, rootHash),
    });
  },

  /**
   * Get all content created by a user
   */
  getUserContent: async (userId: number) => {
    return await db.query.contents.findMany({
      where: eq(schema.contents.creatorId, userId),
      orderBy: [desc(schema.contents.createdAt)],
    });
  },

  /**
   * Get trending content based on engagement metrics
   */
  getTrendingContent: async (limit = 10) => {
    return await db.query.contents.findMany({
      orderBy: [desc(schema.contents.likeCount)],
      limit,
    });
  },

  /**
   * Get content from followed creators
   */
  getFollowingContent: async (userId: number, limit = 20) => {
    const followedCreators = await db
      .select({ creatorId: schema.userFollows.followingId })
      .from(schema.userFollows)
      .where(eq(schema.userFollows.followerId, userId));
    
    const creatorIds = followedCreators.map(fc => fc.creatorId);
    
    if (creatorIds.length === 0) {
      return [];
    }
    
    return await db.query.contents.findMany({
      where: sql`${schema.contents.creatorId} IN ${creatorIds}`,
      orderBy: [desc(schema.contents.createdAt)],
      limit,
    });
  },

  /**
   * Check if a user has liked a content
   */
  hasUserLikedContent: async (userId: number, contentId: number) => {
    const like = await db.query.contentLikes.findFirst({
      where: and(
        eq(schema.contentLikes.userId, userId),
        eq(schema.contentLikes.contentId, contentId)
      ),
    });
    
    return !!like;
  },
};