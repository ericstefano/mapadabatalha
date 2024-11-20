CREATE TABLE IF NOT EXISTS `instagram_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`rhyme_battle_id` text NOT NULL,
	`instagram_profile_id` text NOT NULL,
	`href` text NOT NULL,
	`alt` text NOT NULL,
	`timestamp` integer NOT NULL,
	`post_quantity` integer NOT NULL,
	`description` text NOT NULL,
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
	`error` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `rhyme_battles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`lat` real NOT NULL,
	`lon` real NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`week_day` text NOT NULL,
	`start_time` text(5) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
