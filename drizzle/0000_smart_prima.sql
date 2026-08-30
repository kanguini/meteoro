CREATE TABLE `media` (
	`id` char(36) NOT NULL,
	`url` varchar(400) NOT NULL,
	`storage_path` varchar(300) NOT NULL,
	`filename` varchar(300) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`bytes` int NOT NULL,
	`width` int,
	`height` int,
	`uploaded_by` char(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` char(36) NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(200) NOT NULL,
	`phone` varchar(60) NOT NULL DEFAULT '',
	`subject` varchar(200) NOT NULL DEFAULT '',
	`body` text NOT NULL,
	`locale` varchar(5) NOT NULL DEFAULT 'pt',
	`read_at` timestamp,
	`archived_at` timestamp,
	`emailed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `page_content` (
	`locale` varchar(5) NOT NULL,
	`page` varchar(32) NOT NULL,
	`data` json NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `page_content_locale_page_pk` PRIMARY KEY(`locale`,`page`)
);
--> statement-breakpoint
CREATE TABLE `project_translations` (
	`project_id` char(36) NOT NULL,
	`locale` varchar(5) NOT NULL,
	`title` varchar(200) NOT NULL,
	`summary` text NOT NULL,
	`body` json NOT NULL,
	CONSTRAINT `project_translations_project_id_locale_pk` PRIMARY KEY(`project_id`,`locale`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` char(36) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	`year` varchar(16) NOT NULL DEFAULT '',
	`client` varchar(200) NOT NULL DEFAULT '',
	`location` varchar(200) NOT NULL DEFAULT '',
	`cover_image` varchar(400),
	`gallery` json NOT NULL,
	`service_slugs` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `service_translations` (
	`service_id` char(36) NOT NULL,
	`locale` varchar(5) NOT NULL,
	`title` varchar(200) NOT NULL,
	`short` text NOT NULL,
	`lead` text NOT NULL,
	`body` json NOT NULL,
	`points` json NOT NULL,
	`keywords` json NOT NULL,
	CONSTRAINT `service_translations_service_id_locale_pk` PRIMARY KEY(`service_id`,`locale`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` char(36) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`number` varchar(8) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	`image` varchar(400),
	`image_alt_pt` text NOT NULL,
	`image_alt_en` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` char(64) NOT NULL,
	`user_id` char(36) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_token_hash` PRIMARY KEY(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` varchar(16) NOT NULL,
	`phone` varchar(60) NOT NULL,
	`email` varchar(200) NOT NULL,
	`address_street` varchar(240) NOT NULL,
	`address_city` varchar(120) NOT NULL,
	`slogan` varchar(200) NOT NULL,
	`hours_pt` varchar(160) NOT NULL,
	`hours_en` varchar(160) NOT NULL,
	`linkedin` varchar(300) NOT NULL DEFAULT '',
	`instagram` varchar(300) NOT NULL DEFAULT '',
	`facebook` varchar(300) NOT NULL DEFAULT '',
	`cover_image` varchar(400) NOT NULL,
	`cover_alt_pt` text NOT NULL,
	`cover_alt_en` text NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(36) NOT NULL,
	`email` varchar(200) NOT NULL,
	`name` varchar(160) NOT NULL,
	`password_hash` text NOT NULL,
	`role` varchar(16) NOT NULL DEFAULT 'editor',
	`active` boolean NOT NULL DEFAULT true,
	`last_login_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `messages_created_idx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);