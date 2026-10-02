CREATE TABLE `pauseam_model_usage` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reserved_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_pauseam_model_usage_reserved_at` ON `pauseam_model_usage` (`reserved_at`);