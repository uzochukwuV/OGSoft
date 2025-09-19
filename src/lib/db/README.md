# OGSoft Database Schema

This directory contains the PostgreSQL database schema for the OGSoft platform, implemented using Drizzle ORM.

## Schema Overview

The database schema is designed to support the following core features:

1. **User Management**
   - Store user profiles with wallet addresses
   - Track user types (creator, collector)
   - Manage social media links

2. **Content Storage**
   - Store metadata for uploaded content
   - Link content to blockchain data (root hash, transaction hash)
   - Categorize content by type and category

3. **Social Features**
   - Follow relationships between users
   - Content likes, comments, and saves
   - View counts and engagement metrics

## Key Tables

- `users`: Core user information including wallet address
- `contents`: Uploaded content with blockchain root hash storage
- `user_follows`: Following relationships between users
- `content_likes`: User likes on content
- `content_comments`: User comments on content
- `content_saves`: User bookmarks/saves of content

## Blockchain Integration

The `contents` table includes fields specifically for blockchain data:

- `rootHash`: The Merkle root hash returned from the 0G blockchain upload
- `txHash`: The transaction hash of the blockchain transaction
- `networkType`: The network type (standard or turbo)

## Setup Instructions

1. **Install PostgreSQL**

2. **Create Database**
   ```sql
   CREATE DATABASE ogsoft;
   ```

3. **Install Dependencies**
   ```bash
   npm install drizzle-orm pg
   ```

4. **Generate Migrations**
   ```bash
   npx drizzle-kit generate:pg
   
   ```

5. **Run Migrations**
   ```bash
   node -r ts-node/register src/lib/db/migrations.ts
   ```

## Usage Examples

```typescript
// Import the database client
import { db, schema } from '@/lib/db';

// Query users
const users = await db.select().from(schema.users);

// Insert a new user
const newUser = await db.insert(schema.users).values({
  address: '0x123...',
  username: 'cryptoartist',
  displayName: 'Crypto Artist',
  userType: 'creator',
}).returning();

// Store content with blockchain root hash
const newContent = await db.insert(schema.contents).values({
  creatorId: userId,
  title: 'My NFT Artwork',
  description: 'Digital artwork stored on the blockchain',
  contentType: 'image',
  rootHash: '0x456...', // Root hash from blockchain upload
  txHash: '0x789...', // Transaction hash
  networkType: 'standard',
}).returning();

// Query content with creator information
const contentWithCreator = await db
  .select()
  .from(schema.contents)
  .innerJoin(schema.users, eq(schema.contents.creatorId, schema.users.id));

// Get followers for a user
const followers = await db
  .select()
  .from(schema.userFollows)
  .innerJoin(schema.users, eq(schema.userFollows.followerId, schema.users.id))
  .where(eq(schema.userFollows.followingId, userId));
```

## Environment Variables

The database connection can be configured using the following environment variables:

- `POSTGRES_HOST`: Database host (default: 'localhost')
- `POSTGRES_PORT`: Database port (default: '5432')
- `POSTGRES_USER`: Database user (default: 'postgres')
- `POSTGRES_PASSWORD`: Database password (default: 'postgres')
- `POSTGRES_DB`: Database name (default: 'ogsoft')