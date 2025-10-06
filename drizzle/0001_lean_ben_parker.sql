CREATE TYPE "public"."artist_type" AS ENUM('digital_artist', 'traditional_artist', 'photographer', 'designer', 'ui_designer', 'other');--> statement-breakpoint
CREATE TYPE "public"."sale_status" AS ENUM('available', 'sold', 'reserved');--> statement-breakpoint
CREATE TABLE "artwork_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" integer NOT NULL,
	"medium" varchar(100),
	"dimensions" varchar(100),
	"edition" varchar(50),
	"edition_count" integer,
	"is_original" boolean DEFAULT true,
	"created_year" varchar(10),
	"materials" text,
	"framed" boolean DEFAULT false,
	"frame_details" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commission_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_id" integer NOT NULL,
	"requester_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"budget" varchar(50),
	"deadline" timestamp,
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "thumbnails" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" integer NOT NULL,
	"thumbnail_url" text NOT NULL,
	"width" integer,
	"height" integer,
	"size" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_id" integer NOT NULL,
	"seller_id" integer NOT NULL,
	"buyer_id" integer NOT NULL,
	"price" varchar(50) NOT NULL,
	"tx_hash" varchar(66),
	"status" varchar(20) DEFAULT 'completed',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "contents" ADD COLUMN "is_for_sale" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "contents" ADD COLUMN "sale_status" "sale_status" DEFAULT 'available';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "artist_type" "artist_type";--> statement-breakpoint
ALTER TABLE "artwork_details" ADD CONSTRAINT "artwork_details_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_requests" ADD CONSTRAINT "commission_requests_artist_id_users_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_requests" ADD CONSTRAINT "commission_requests_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thumbnails" ADD CONSTRAINT "thumbnails_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;