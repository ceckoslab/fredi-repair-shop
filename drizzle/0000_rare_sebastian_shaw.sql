CREATE TABLE `bookings` (
	`ticket` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`device` text NOT NULL,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`service` text NOT NULL,
	`issue` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`language` text NOT NULL,
	`status` text NOT NULL,
	`note` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_request_id_unique` ON `bookings` (`request_id`);--> statement-breakpoint
CREATE INDEX `bookings_created` ON `bookings` (`created_at`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
