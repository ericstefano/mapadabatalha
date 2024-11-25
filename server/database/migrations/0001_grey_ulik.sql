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
