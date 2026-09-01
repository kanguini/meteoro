CREATE TABLE `applications` (
	`id` char(36) NOT NULL,
	`job_id` char(36),
	`job_title` varchar(200) NOT NULL DEFAULT '',
	`name` varchar(160) NOT NULL,
	`email` varchar(200) NOT NULL,
	`phone` varchar(60) NOT NULL DEFAULT '',
	`message` text NOT NULL DEFAULT (''),
	`cv_path` varchar(300) NOT NULL DEFAULT '',
	`cv_filename` varchar(300) NOT NULL DEFAULT '',
	`locale` varchar(5) NOT NULL DEFAULT 'pt',
	`status` varchar(20) NOT NULL DEFAULT 'nova',
	`notes` text NOT NULL DEFAULT (''),
	`read_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_translations` (
	`job_id` char(36) NOT NULL,
	`locale` varchar(5) NOT NULL,
	`title` varchar(200) NOT NULL,
	`department` varchar(160) NOT NULL DEFAULT '',
	`type` varchar(80) NOT NULL DEFAULT '',
	`location` varchar(160) NOT NULL DEFAULT '',
	`intro` text NOT NULL,
	`sections` json NOT NULL,
	`profile` text NOT NULL DEFAULT (''),
	CONSTRAINT `job_translations_job_id_locale_pk` PRIMARY KEY(`job_id`,`locale`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` char(36) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `jobs_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `applications_created_idx` ON `applications` (`created_at`);