PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_instagram_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`rhyme_battle_id` text NOT NULL,
	`instagram_profile_id` text NOT NULL,
	`href` text NOT NULL,
	`alt` text,
	`timestamp` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`rhyme_battle_id`) REFERENCES `rhyme_battles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`instagram_profile_id`) REFERENCES `instagram_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_instagram_posts`("id", "rhyme_battle_id", "instagram_profile_id", "href", "alt", "timestamp", "created_at", "updated_at") SELECT "id", "rhyme_battle_id", "instagram_profile_id", "href", "alt", "timestamp", "created_at", "updated_at" FROM `instagram_posts`;--> statement-breakpoint
DROP TABLE `instagram_posts`;--> statement-breakpoint
ALTER TABLE `__new_instagram_posts` RENAME TO `instagram_posts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_post_analyses` (
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
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`rhyme_battle_id`) REFERENCES `rhyme_battles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_post_analyses`("id", "rhyme_battle_id", "instagram_post_id", "model", "provider", "native_tokens_prompt", "native_tokens_completion", "total_cost", "generation_time", "latency", "raw_content", "parsed_content", "errors", "created_at", "updated_at") SELECT "id", "rhyme_battle_id", "instagram_post_id", "model", "provider", "native_tokens_prompt", "native_tokens_completion", "total_cost", "generation_time", "latency", "raw_content", "parsed_content", "errors", "created_at", "updated_at" FROM `post_analyses`;--> statement-breakpoint
DROP TABLE `post_analyses`;--> statement-breakpoint
ALTER TABLE `__new_post_analyses` RENAME TO `post_analyses`;--> statement-breakpoint
CREATE UNIQUE INDEX `post_analyses_instagram_post_id_unique` ON `post_analyses` (`instagram_post_id`);--> statement-breakpoint
CREATE TABLE `__new_post_identifications` (
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
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`rhyme_battle_id`) REFERENCES `rhyme_battles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_post_identifications`("id", "rhyme_battle_id", "instagram_post_id", "model", "provider", "native_tokens_prompt", "native_tokens_completion", "total_cost", "generation_time", "latency", "raw_content", "parsed_content", "error", "created_at", "updated_at") SELECT "id", "rhyme_battle_id", "instagram_post_id", "model", "provider", "native_tokens_prompt", "native_tokens_completion", "total_cost", "generation_time", "latency", "raw_content", "parsed_content", "error", "created_at", "updated_at" FROM `post_identifications`;--> statement-breakpoint
DROP TABLE `post_identifications`;--> statement-breakpoint
ALTER TABLE `__new_post_identifications` RENAME TO `post_identifications`;--> statement-breakpoint
CREATE UNIQUE INDEX `post_identifications_instagram_post_id_unique` ON `post_identifications` (`instagram_post_id`);