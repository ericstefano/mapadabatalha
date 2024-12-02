CREATE TABLE IF NOT EXISTS `instagram_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`rhyme_battle_id` text NOT NULL,
	`instagram_profile_id` text NOT NULL,
	`href` text NOT NULL,
	`timestamp` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `instagram_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`rhyme_battle_id` text NOT NULL,
	`username` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `instagram_profiles_username_unique` ON `instagram_profiles` (`username`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `post_analyses` (
	`id` text PRIMARY KEY NOT NULL,
	`rhyme_battle_id` text NOT NULL,
	`instagram_post_id` text NOT NULL,
	`model` text NOT NULL,
	`provider` text NOT NULL,
	`native_tokens_prompt` integer,
	`native_tokens_completion` integer,
	`total_cost` integer,
	`generation_time` integer,
	`latency` integer,
	`raw_content` text,
	`parsed_content` text,
	`errors` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `post_analyses_instagram_post_id_unique` ON `post_analyses` (`instagram_post_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `post_identifications` (
	`id` text PRIMARY KEY NOT NULL,
	`rhyme_battle_id` text NOT NULL,
	`instagram_post_id` text NOT NULL,
	`model` text NOT NULL,
	`provider` text NOT NULL,
	`native_tokens_prompt` integer,
	`native_tokens_completion` integer,
	`total_cost` integer,
	`generation_time` integer,
	`latency` integer,
	`raw_content` text,
	`parsed_content` text,
	`error` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `post_identifications_instagram_post_id_unique` ON `post_identifications` (`instagram_post_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `rhyme_battles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`lat` real NOT NULL,
	`lon` real NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
