CREATE TABLE `doc` (
	`doc_id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`status` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `doc` (`created_at`);