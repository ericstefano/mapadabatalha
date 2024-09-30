ALTER TABLE "instagram_posts" DROP CONSTRAINT "instagram_posts_battle_id_rhyme_battle_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "instagram_posts" ADD CONSTRAINT "instagram_posts_battle_id_rhyme_battle_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."rhyme_battle"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
