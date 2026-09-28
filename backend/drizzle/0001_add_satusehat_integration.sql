-- Add SATUSEHAT columns to patients
ALTER TABLE `patients` ADD COLUMN `nik` varchar(20);
--> statement-breakpoint
ALTER TABLE `patients` ADD COLUMN `ihs_number` varchar(50);
--> statement-breakpoint

-- Add SATUSEHAT columns to doctors
ALTER TABLE `doctors` ADD COLUMN `nik` varchar(20);
--> statement-breakpoint
ALTER TABLE `doctors` ADD COLUMN `ihs_number` varchar(50);
--> statement-breakpoint

-- Add SATUSEHAT columns to orders
ALTER TABLE `orders` ADD COLUMN `study_instance_uid` varchar(128);
--> statement-breakpoint
ALTER TABLE `orders` ADD COLUMN `satusehat_status` enum('unmapped','pending','synced','failed') DEFAULT 'unmapped';
--> statement-breakpoint
ALTER TABLE `orders` ADD COLUMN `satusehat_study_id` varchar(100);
--> statement-breakpoint
ALTER TABLE `orders` ADD COLUMN `satusehat_report_id` varchar(100);
--> statement-breakpoint

-- Create SATUSEHAT Logs table
CREATE TABLE IF NOT EXISTS `satusehat_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`order_id` bigint unsigned,
	`patient_id` bigint unsigned,
	`resource_type` enum('Patient','Practitioner','ServiceRequest','ImagingStudy','DiagnosticReport','Encounter','Auth') NOT NULL,
	`action` varchar(100) NOT NULL,
	`status` enum('pending','success','failed') NOT NULL,
	`satusehat_id` varchar(100),
	`http_status` int,
	`request_payload` json,
	`response_payload` json,
	`error_message` text,
	`retry_count` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `satusehat_logs_id` PRIMARY KEY(`id`),
	CONSTRAINT `satusehat_logs_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL,
	CONSTRAINT `satusehat_logs_patient_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint

-- Create SATUSEHAT Settings table
CREATE TABLE IF NOT EXISTS `satusehat_settings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`organization_id` varchar(100) NOT NULL DEFAULT '10000004',
	`client_id` varchar(255) DEFAULT '',
	`client_secret` varchar(255) DEFAULT '',
	`environment` enum('sandbox','staging','production') DEFAULT 'staging',
	`auth_url` varchar(255) DEFAULT 'https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1',
	`base_url` varchar(255) DEFAULT 'https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1',
	`auto_sync_on_expertise` enum('yes','no') DEFAULT 'yes',
	`simulation_mode` enum('yes','no') DEFAULT 'yes',
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `satusehat_settings_id` PRIMARY KEY(`id`)
);
