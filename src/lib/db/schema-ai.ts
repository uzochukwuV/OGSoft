import { pgTable, serial, text, timestamp, boolean, integer, pgEnum, varchar, uniqueIndex, foreignKey, jsonb, numeric } from 'drizzle-orm/pg-core';
import { users } from './schema';

/**
 * PostgreSQL database schema for AI features in OGSoft platform
 * 
 * This schema defines the structure for:
 * - AI Agents (INFTs)
 * - Agent metadata
 * - Usage authorizations
 * - Subscriptions
 * - Inference logs
 * - Agent compositions
 */

// Enum for agent types
export const agentTypeEnum = pgEnum('agent_type', ['text', 'image', 'audio', 'multimodal', 'composite']);

// Enum for agent status
export const agentStatusEnum = pgEnum('agent_status', ['active', 'inactive', 'evolving']);

// Enum for verification modes
export const verificationModeEnum = pgEnum('verification_mode', ['TEE', 'ZKP', 'none']);

// Import sale status enum from main schema
import { saleStatusEnum } from './schema';

// AI Agents table for INFTs
export const aiAgents = pgTable('ai_agents', {
  id: serial('id').primaryKey(),
  creatorId: varchar('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  agentType: text('agent_type').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  price: varchar('price', { length: 50 }),
  
  // INFT data
  tokenId: varchar('token_id', { length: 78 }),
  encryptedUri: text('encrypted_uri').notNull(),
  metadataHash: varchar('metadata_hash', { length: 66 }).notNull(),
  txHash: varchar('tx_hash', { length: 66 }),
  
  // Status and metrics
  status: agentStatusEnum('status').default('active'),
  featured: boolean('featured').default(false),
  usageCount: integer('usage_count').default(0),
  rating: numeric('rating', { precision: 3, scale: 2 }),
  
  // Marketplace fields
  isForSale: boolean('is_for_sale').default(true),
  saleStatus: saleStatusEnum('sale_status').default('available'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// AI Agent metadata
export const aiAgentMetadata = pgTable('ai_agent_metadata', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').notNull().references(() => aiAgents.id, { onDelete: 'cascade' }),
  modelName: varchar('model_name', { length: 100 }),
  modelVersion: varchar('model_version', { length: 50 }),
  parameters: jsonb('parameters'),
  capabilities: text('capabilities').array(),
  verificationMode: verificationModeEnum('verification_mode').default('none'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// AI Agent usage authorizations
export const aiAgentAuthorizations = pgTable('ai_agent_authorizations', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').notNull().references(() => aiAgents.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  maxRequests: integer('max_requests'),
  rateLimit: integer('rate_limit'),
  allowedOperations: text('allowed_operations').array(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    agentUserAuthIdx: uniqueIndex('agent_user_auth_idx').on(table.agentId, table.userId),
  };
});

// AI Agent subscriptions
export const aiAgentSubscriptions = pgTable('ai_agent_subscriptions', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').notNull().references(() => aiAgents.id, { onDelete: 'cascade' }),
  subscriberId: integer('subscriber_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planName: varchar('plan_name', { length: 100 }),
  price: varchar('price', { length: 50 }).notNull(),
  durationDays: integer('duration_days').notNull(),
  startsAt: timestamp('starts_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  autoRenew: boolean('auto_renew').default(false),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    agentSubscriberIdx: uniqueIndex('agent_subscriber_idx').on(table.agentId, table.subscriberId, table.status),
  };
});

// AI Agent inference logs
export const aiAgentInferenceLogs = pgTable('ai_agent_inference_logs', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').notNull().references(() => aiAgents.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  input: text('input'),
  output: text('output'),
  tokensUsed: integer('tokens_used'),
  processingTime: integer('processing_time'), // in milliseconds
  status: varchar('status', { length: 20 }),
  verificationProof: text('verification_proof'),
  createdAt: timestamp('created_at').defaultNow(),
});

// AI Agent composite relationships
export const aiAgentCompositions = pgTable('ai_agent_compositions', {
  id: serial('id').primaryKey(),
  compositeAgentId: integer('composite_agent_id').notNull().references(() => aiAgents.id, { onDelete: 'cascade' }),
  componentAgentId: integer('component_agent_id').notNull().references(() => aiAgents.id, { onDelete: 'cascade' }),
  compositionRules: jsonb('composition_rules'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    compositeComponentIdx: uniqueIndex('composite_component_idx').on(table.compositeAgentId, table.componentAgentId),
  };
});