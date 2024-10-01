CREATE TABLE IF NOT EXISTS "instagram_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"instagram_profile_id" text NOT NULL,
	"href" text NOT NULL,
	"src" text NOT NULL,
	"alt" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"post_quantity" integer NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "instagram_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"rhyme_battle_id" text NOT NULL,
	"username" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_analyses" (
	"id" text PRIMARY KEY NOT NULL,
	"instagram_post_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rhyme_battles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"lat" real NOT NULL,
	"lon" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
