CREATE TABLE IF NOT EXISTS "instagram_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"battle_id" text NOT NULL,
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
CREATE TABLE IF NOT EXISTS "rhyme_battle" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"instagram" text NOT NULL,
	"lat" real NOT NULL,
	"lon" real NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "instagram_posts" ADD CONSTRAINT "instagram_posts_battle_id_rhyme_battle_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."rhyme_battle"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
