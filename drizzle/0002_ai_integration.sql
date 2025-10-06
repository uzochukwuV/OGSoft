CREATE TYPE "public"."agent_type" AS ENUM('text', 'image', 'audio', 'multimodal', 'composite');--> statement-breakpoint
CREATE TYPE "public"."agent_status" AS ENUM('active', 'inactive', 'evolving');--> statement-breakpoint
CREATE TYPE "public"."verification_mode" AS ENUM('TEE', 'ZKP', 'none');--> statement-breakpoint

-- AI Agents table for INFTs
CREATE TABLE "ai_agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"agent_type" "agent_type" NOT NULL,
	"thumbnail_url" text,
	"price" varchar(50),
	
	-- INFT data
	"token_id" varchar(78),
	"encrypted_uri" text NOT NULL,
	"metadata_hash" varchar(66) NOT NULL,
	"tx_hash" varchar(66),
	
	-- Status and metrics
	"status" "agent_status" DEFAULT 'active',
	"featured" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"rating" numeric(3, 2),
	
	-- Marketplace fields
	"is_for_sale" boolean DEFAULT true,
	"sale_status" "sale_status" DEFAULT 'available',
	
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);--> statement-breakpoint

-- AI Agent metadata
CREATE TABLE "ai_agent_metadata" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"model_name" varchar(100),
	"model_version" varchar(50),
	"parameters" jsonb,
	"capabilities" text[],
	"verification_mode" "verification_mode" DEFAULT 'none',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);--> statement-breakpoint

-- AI Agent usage authorizations
CREATE TABLE "ai_agent_authorizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"max_requests" integer,
	"rate_limit" integer,
	"allowed_operations" text[],
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);--> statement-breakpoint

-- AI Agent subscriptions
CREATE TABLE "ai_agent_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"subscriber_id" integer NOT NULL,
	"plan_name" varchar(100),
	"price" varchar(50) NOT NULL,
	"duration_days" integer NOT NULL,
	"starts_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	"auto_renew" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);--> statement-breakpoint

-- AI Agent inference logs
CREATE TABLE "ai_agent_inference_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"input" text,
	"output" text,
	"tokens_used" integer,
	"processing_time" integer, -- in milliseconds
	"status" varchar(20),
	"verification_proof" text,
	"created_at" timestamp DEFAULT now()
);--> statement-breakpoint

-- AI Agent composite relationships
CREATE TABLE "ai_agent_compositions" (
	"id" serial PRIMARY KEY NOT NULL,
	"composite_agent_id" integer NOT NULL,
	"component_agent_id" integer NOT NULL,
	"composition_rules" jsonb,
	"created_at" timestamp DEFAULT now()
);--> statement-breakpoint

-- Foreign key constraints
ALTER TABLE "ai_agents" ADD CONSTRAINT "ai_agents_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_metadata" ADD CONSTRAINT "ai_agent_metadata_agent_id_ai_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_authorizations" ADD CONSTRAINT "ai_agent_authorizations_agent_id_ai_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_authorizations" ADD CONSTRAINT "ai_agent_authorizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_subscriptions" ADD CONSTRAINT "ai_agent_subscriptions_agent_id_ai_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_subscriptions" ADD CONSTRAINT "ai_agent_subscriptions_subscriber_id_users_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_inference_logs" ADD CONSTRAINT "ai_agent_inference_logs_agent_id_ai_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_inference_logs" ADD CONSTRAINT "ai_agent_inference_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_compositions" ADD CONSTRAINT "ai_agent_compositions_composite_agent_id_ai_agents_id_fk" FOREIGN KEY ("composite_agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_compositions" ADD CONSTRAINT "ai_agent_compositions_component_agent_id_ai_agents_id_fk" FOREIGN KEY ("component_agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Create unique index for agent compositions to prevent duplicates
CREATE UNIQUE INDEX "composite_component_idx" ON "ai_agent_compositions" ("composite_agent_id", "component_agent_id");--> statement-breakpoint

-- Create unique index for agent authorizations to prevent duplicates
CREATE UNIQUE INDEX "agent_user_auth_idx" ON "ai_agent_authorizations" ("agent_id", "user_id");--> statement-breakpoint

-- Create unique index for agent subscriptions to prevent duplicates
CREATE UNIQUE INDEX "agent_subscriber_idx" ON "ai_agent_subscriptions" ("agent_id", "subscriber_id", "status");