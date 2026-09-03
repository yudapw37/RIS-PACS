CREATE TABLE `doctors` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned,
	`nip` varchar(50),
	`full_name` varchar(255) NOT NULL,
	`specialization` varchar(150),
	`department` varchar(150),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `doctors_id` PRIMARY KEY(`id`),
	CONSTRAINT `doctors_nip_unique` UNIQUE(`nip`)
);
--> statement-breakpoint
CREATE TABLE `expertise` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`order_id` bigint unsigned NOT NULL,
	`doctor_id` bigint unsigned NOT NULL,
	`findings` text,
	`conclusions` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `expertise_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modalities` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`type_code` varchar(10) NOT NULL,
	`aet` varchar(50) NOT NULL,
	`ip_address` varchar(45) NOT NULL,
	`port` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `modalities_id` PRIMARY KEY(`id`),
	CONSTRAINT `modalities_aet_unique` UNIQUE(`aet`)
);
--> statement-breakpoint
CREATE TABLE `modality_connection_logs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`modality_id` bigint unsigned NOT NULL,
	`status` enum('success','failed') NOT NULL,
	`message` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `modality_connection_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modality_types` (
	`code` varchar(10) NOT NULL,
	`description` varchar(100),
	CONSTRAINT `modality_types_code` PRIMARY KEY(`code`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`patient_id` bigint unsigned NOT NULL,
	`no_reg` varchar(50) NOT NULL,
	`doctor_id` bigint unsigned,
	`accession_number` varchar(50) NOT NULL,
	`modality_type_code` varchar(10) NOT NULL,
	`modality_id` bigint unsigned,
	`body_part` varchar(100),
	`clinical_info` text,
	`priority` enum('routine','urgent','stat') DEFAULT 'routine',
	`status` enum('scheduled','in_progress','completed','canceled','failed') DEFAULT 'scheduled',
	`order_date` timestamp DEFAULT (now()),
	`radiographer_id` bigint unsigned,
	`exam_started_at` timestamp,
	`exam_finished_at` timestamp,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_accession_number_unique` UNIQUE(`accession_number`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`mrn` varchar(50) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`dob` date,
	`gender` enum('L','P'),
	`address` text,
	`hl7_metadata` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `patients_id` PRIMARY KEY(`id`),
	CONSTRAINT `patients_mrn_unique` UNIQUE(`mrn`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` enum('admin','radiografer','dokter') NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
ALTER TABLE `doctors` ADD CONSTRAINT `doctors_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expertise` ADD CONSTRAINT `expertise_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `expertise` ADD CONSTRAINT `expertise_doctor_id_doctors_id_fk` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `modalities` ADD CONSTRAINT `modalities_type_code_modality_types_code_fk` FOREIGN KEY (`type_code`) REFERENCES `modality_types`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `modality_connection_logs` ADD CONSTRAINT `modality_connection_logs_modality_id_modalities_id_fk` FOREIGN KEY (`modality_id`) REFERENCES `modalities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_doctor_id_doctors_id_fk` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_modality_type_code_modality_types_code_fk` FOREIGN KEY (`modality_type_code`) REFERENCES `modality_types`(`code`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_modality_id_modalities_id_fk` FOREIGN KEY (`modality_id`) REFERENCES `modalities`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_radiographer_id_users_id_fk` FOREIGN KEY (`radiographer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;