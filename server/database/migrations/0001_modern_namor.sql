ALTER TABLE "instagram_posts" DROP COLUMN IF EXISTS "deleted_at";--> statement-breakpoint
ALTER TABLE "instagram_profiles" DROP COLUMN IF EXISTS "deleted_at";--> statement-breakpoint
ALTER TABLE "post_analyses" DROP COLUMN IF EXISTS "deleted_at";--> statement-breakpoint
ALTER TABLE "rhyme_battles" DROP COLUMN IF EXISTS "deleted_at";