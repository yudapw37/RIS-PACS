-- ================================================================
-- SmartRIS V3 - MySQL Database Initialization
-- File ini otomatis dijalankan saat pertama kali container MySQL up
-- Harus sinkron dengan backend/src/db/schema.ts (Drizzle ORM)
-- ================================================================

-- Pastikan charset UTF8MB4 digunakan
ALTER DATABASE ris_v3 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========== 1. Users ==========
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'radiografer', 'dokter') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 1.5 Doctors ==========
CREATE TABLE IF NOT EXISTS `doctors` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `nip` VARCHAR(50) UNIQUE,
  `full_name` VARCHAR(255) NOT NULL,
  `specialization` VARCHAR(150) DEFAULT NULL,
  `department` VARCHAR(150) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 2. Patients ==========
CREATE TABLE IF NOT EXISTS `patients` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `mrn` VARCHAR(50) NOT NULL UNIQUE,
  `full_name` VARCHAR(255) NOT NULL,
  `dob` DATE DEFAULT NULL,
  `gender` ENUM('L', 'P') DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `hl7_metadata` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_patients_mrn` (`mrn`),
  INDEX `idx_patients_fullname` (`full_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 2.5 Modality Types ==========
CREATE TABLE IF NOT EXISTS `modality_types` (
  `code` VARCHAR(10) NOT NULL PRIMARY KEY,
  `description` VARCHAR(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 3. Modalities ==========
CREATE TABLE IF NOT EXISTS `modalities` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `type_code` VARCHAR(10) NOT NULL,
  `aet` VARCHAR(50) NOT NULL UNIQUE,
  `ip_address` VARCHAR(45) NOT NULL,
  `port` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`type_code`) REFERENCES `modality_types`(`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 3.5 Modality Connection Logs ==========
CREATE TABLE IF NOT EXISTS `modality_connection_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `modality_id` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('success', 'failed') NOT NULL,
  `message` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`modality_id`) REFERENCES `modalities`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 4. Orders (Worklist DICOM) ==========
CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `patient_id` BIGINT UNSIGNED NOT NULL,
  `no_reg` VARCHAR(50) NOT NULL,
  `doctor_id` BIGINT UNSIGNED DEFAULT NULL,
  `accession_number` VARCHAR(50) NOT NULL UNIQUE,
  `modality_type_code` VARCHAR(10) NOT NULL,
  `modality_id` BIGINT UNSIGNED DEFAULT NULL,
  `body_part` VARCHAR(100) DEFAULT NULL,
  `clinical_info` TEXT DEFAULT NULL,
  `priority` ENUM('routine', 'urgent', 'stat') DEFAULT 'routine',
  `status` ENUM('scheduled', 'in_progress', 'completed', 'canceled', 'failed') DEFAULT 'scheduled',
  `order_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `radiographer_id` BIGINT UNSIGNED DEFAULT NULL,
  `exam_started_at` TIMESTAMP NULL DEFAULT NULL,
  `exam_finished_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`),
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`modality_type_code`) REFERENCES `modality_types`(`code`),
  FOREIGN KEY (`modality_id`) REFERENCES `modalities`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`radiographer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_accession` (`accession_number`),
  INDEX `idx_orders_date` (`order_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== 5. Expertise (Hasil Bacaan Radiologi) ==========
CREATE TABLE IF NOT EXISTS `expertise` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `doctor_id` BIGINT UNSIGNED NOT NULL,
  `findings` TEXT DEFAULT NULL,
  `conclusions` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`),
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== Seed: Modality Types (Standar DICOM) ==========
INSERT IGNORE INTO `modality_types` (`code`, `description`) VALUES
  ('CR', 'Computed Radiography'),
  ('CT', 'Computed Tomography'),
  ('DX', 'Digital Radiography'),
  ('ES', 'Endoscopy'),
  ('IO', 'Intra-oral Radiography'),
  ('MG', 'Mammography'),
  ('MR', 'Magnetic Resonance'),
  ('NM', 'Nuclear Medicine'),
  ('OT', 'Other'),
  ('PT', 'PET Scan'),
  ('RF', 'Radio Fluoroscopy'),
  ('US', 'Ultrasound'),
  ('XA', 'X-Ray Angiography');
