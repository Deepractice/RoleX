CREATE TABLE IF NOT EXISTS `contexts` (
	`role_id` text PRIMARY KEY NOT NULL,
	`focused_goal_id` text,
	`focused_plan_id` text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `links` (
	`from_ref` text NOT NULL,
	`to_ref` text NOT NULL,
	`relation` text NOT NULL,
	PRIMARY KEY(`from_ref`, `to_ref`, `relation`),
	FOREIGN KEY (`from_ref`) REFERENCES `nodes`(`ref`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_ref`) REFERENCES `nodes`(`ref`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_links_from` ON `links` (`from_ref`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_links_to` ON `links` (`to_ref`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `nodes` (
	`ref` text PRIMARY KEY NOT NULL,
	`id` text,
	`alias` text,
	`name` text NOT NULL,
	`description` text DEFAULT '',
	`parent_ref` text,
	`information` text,
	`tag` text,
	FOREIGN KEY (`parent_ref`) REFERENCES `nodes`(`ref`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_nodes_id` ON `nodes` (`id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_nodes_name` ON `nodes` (`name`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_nodes_parent_ref` ON `nodes` (`parent_ref`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `prototype_migrations` (
	`prototype_id` text NOT NULL,
	`migration_id` text NOT NULL,
	`checksum` text NOT NULL,
	`executed_at` text NOT NULL,
	PRIMARY KEY(`prototype_id`, `migration_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `prototypes` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL
);
