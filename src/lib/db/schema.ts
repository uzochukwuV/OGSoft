import { pgTable, serial, text, timestamp, boolean, integer, pgEnum, varchar, uniqueIndex, foreignKey } from 'drizzle-orm/pg-core';

/**
 * PostgreSQL database schema for OGSoft platform
 * 
 * This schema defines the structure for:
 * - Users and their profiles
 * - Content uploaded by users (with blockchain root hash storage)
 * - Following relationships between users
 * - Content categories and types
 */

// Enum for user types (creator, collector, etc.)
export const userTypeEnum = pgEnum('user_type', ['creator', 'collector', 'both']);

// Enum for content types
export const contentTypeEnum = pgEnum('content_type', ['image', 'video', 'audio', 'document', 'other']);

// Enum for content status
export const contentStatusEnum = pgEnum('content_status', ['draft', 'published', 'archived']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  address: varchar('address', { length: 42 }).notNull().unique(), // Ethereum wallet address
  username: varchar('username', { length: 50 }).notNull().unique(),
  displayName: varchar('display_name', { length: 100 }),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  coverUrl: text('cover_url'),
  userType: userTypeEnum('user_type').default('collector'),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Social links for users
export const userSocials = pgTable('user_socials', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  platform: varchar('platform', { length: 50 }).notNull(), // twitter, instagram, etc.
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Content categories
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Content table - stores uploaded content with blockchain root hash
export const contents = pgTable('contents', {
  id: serial('id').primaryKey(),
  creatorId: integer('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  contentType: contentTypeEnum('content_type').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  thumbnailUrl: text('thumbnail_url'),
  price: varchar('price', { length: 50 }), // Store as string to handle crypto prices
  
  // Blockchain data
  rootHash: varchar('root_hash', { length: 66 }).notNull(), // 0x + 64 hex chars
  txHash: varchar('tx_hash', { length: 66 }), // Transaction hash
  networkType: varchar('network_type', { length: 20 }).notNull(), // standard or turbo
  
  // Content metadata
  fileSize: integer('file_size'), // in bytes
  fileName: varchar('file_name', { length: 255 }),
  mimeType: varchar('mime_type', { length: 100 }),
  
  // Status and metrics
  status: contentStatusEnum('status').default('published'),
  featured: boolean('featured').default(false),
  viewCount: integer('view_count').default(0),
  likeCount: integer('like_count').default(0),
  commentCount: integer('comment_count').default(0),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Content likes
export const contentLikes = pgTable('content_likes', {
  id: serial('id').primaryKey(),
  contentId: integer('content_id').notNull().references(() => contents.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    contentUserIdx: uniqueIndex('content_user_idx').on(table.contentId, table.userId),
  };
});

// Content comments
export const contentComments = pgTable('content_comments', {
  id: serial('id').primaryKey(),
  contentId: integer('content_id').notNull().references(() => contents.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User following relationships
export const userFollows = pgTable('user_follows', {
  id: serial('id').primaryKey(),
  followerId: integer('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: integer('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    followerFollowingIdx: uniqueIndex('follower_following_idx').on(table.followerId, table.followingId),
  };
});

// Content saves/bookmarks
export const contentSaves = pgTable('content_saves', {
  id: serial('id').primaryKey(),
  contentId: integer('content_id').notNull().references(() => contents.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    contentUserSaveIdx: uniqueIndex('content_user_save_idx').on(table.contentId, table.userId),
  };
});