-- ========================================================
-- ShopAI: shop_db Registration Schema
-- Dedicated to Registration Form Data with Subfolders
-- Database: shop_db
-- ========================================================

CREATE DATABASE IF NOT EXISTS `shop_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `shop_db`;

DROP VIEW IF EXISTS `users`;
DROP VIEW IF EXISTS `feedback`;
DROP TABLE IF EXISTS `registration__logs`;
DROP TABLE IF EXISTS `personal__credentials`;
DROP TABLE IF EXISTS `personal__info`;
DROP TABLE IF EXISTS `preferences__address`;
DROP TABLE IF EXISTS `preferences__interests`;
DROP TABLE IF EXISTS `registration__details`;

-- ========================================================
-- SUBFOLDER 1: registration (registration__*)
-- ========================================================

-- 1.1 Master Table: Complete Registration Details (All Form Fields)
CREATE TABLE `registration__details` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `dob` DATE NULL,
    `age` INT NULL,
    `gender` VARCHAR(20) NOT NULL DEFAULT 'other',
    `pref_time` TIME NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `address` TEXT NULL,
    `city` VARCHAR(80) NULL,
    `state` VARCHAR(80) NULL,
    `country` VARCHAR(50) DEFAULT 'India',
    `preferred_categories` TEXT NULL,
    `preferred_brands` TEXT NULL,
    `budget_range` VARCHAR(50) NULL,
    `interests_skills` VARCHAR(255) NULL,
    `profile_pic` VARCHAR(255) NULL,
    `additional_comments` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.2 Registration Audit & Security Logs
CREATE TABLE `registration__logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `registration_id` INT NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `ip_address` VARCHAR(45) DEFAULT '127.0.0.1',
    `status` VARCHAR(50) DEFAULT 'Success',
    `registered_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`registration_id`) REFERENCES `registration__details`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- SUBFOLDER 2: personal (personal__*)
-- ========================================================

-- 2.1 Personal Information
CREATE TABLE `personal__info` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `registration_id` INT NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `dob` DATE NULL,
    `age` INT NULL,
    `gender` VARCHAR(20) NOT NULL,
    `pref_time` TIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`registration_id`) REFERENCES `registration__details`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.2 Personal Authentication Credentials
CREATE TABLE `personal__credentials` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `registration_id` INT NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`registration_id`) REFERENCES `registration__details`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- SUBFOLDER 3: preferences (preferences__*)
-- ========================================================

-- 3.1 Address Information
CREATE TABLE `preferences__address` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `registration_id` INT NOT NULL,
    `address` TEXT NULL,
    `city` VARCHAR(80) NULL,
    `state` VARCHAR(80) NULL,
    `country` VARCHAR(50) DEFAULT 'India',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`registration_id`) REFERENCES `registration__details`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.2 User Preferences & Shopping Interests
CREATE TABLE `preferences__interests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `registration_id` INT NOT NULL,
    `preferred_categories` TEXT NULL,
    `preferred_brands` TEXT NULL,
    `budget_range` VARCHAR(50) NULL,
    `interests_skills` VARCHAR(255) NULL,
    `profile_pic` VARCHAR(255) NULL,
    `additional_comments` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`registration_id`) REFERENCES `registration__details`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- COMPATIBILITY VIEW (for records.php)
-- ========================================================
CREATE OR REPLACE VIEW `users` AS 
SELECT 
    `id`,
    `full_name`,
    `email`,
    `phone`,
    `dob`,
    `gender`,
    `pref_time`,
    `address`,
    `city`,
    `state`,
    `country`,
    `preferred_categories` AS `category_prefs`,
    `preferred_brands` AS `brand_prefs`,
    `budget_range`,
    `profile_pic`,
    `additional_comments` AS `additional_notes`,
    `password_hash`,
    `created_at`
FROM `registration__details`;

-- ========================================================
-- INITIAL SEED DATA
-- ========================================================

INSERT INTO `registration__details` 
(`id`, `full_name`, `email`, `phone`, `dob`, `age`, `gender`, `pref_time`, `password_hash`, `address`, `city`, `state`, `country`, `preferred_categories`, `preferred_brands`, `budget_range`, `interests_skills`, `profile_pic`, `additional_comments`, `created_at`)
VALUES 
(1, 'Kavitha Raman', 'kavitha@example.com', '9876543210', '1998-05-14', 28, 'female', '10:00:00', '$2y$10$wK1W2Q6R9h8x5o7y1u3mCeQZc4pG7iL3pA9fB8kH6tM5jP7qW2n4e', '12 Anna Salai, Guindy', 'Chennai', 'Tamil Nadu', 'India', 'Laptops, Audio', 'Apple, Sony', '50000-100000', 'Coding, Audio Mixing', NULL, 'Looking for lightweight laptop for programming', '2026-10-12 09:15:00'),
(2, 'Suresh Kumar', 'suresh.k@example.com', '9123456789', '1995-11-20', 30, 'male', '14:30:00', '$2y$10$tZ9A3B5C7D1E3F5G7H9I1J3K5L7M9N1O3P5Q7R9S1T3U5V7W9X1Y3', '45 Indiranagar 100ft Road', 'Bengaluru', 'Karnataka', 'India', 'Smartphones, Gaming', 'Samsung, ASUS', '25000-50000', 'Mobile Gaming, Tech Reviews', NULL, 'Interested in 120Hz display phones', '2026-10-12 08:30:00'),
(3, 'Rahul Sharma', 'rahul@example.com', '9845123456', '1996-03-21', 30, 'male', '18:00:00', '$2y$10$a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a', '88 Bandra West', 'Mumbai', 'Maharashtra', 'India', 'Laptops, Accessories', 'Apple, Dell', '50000-100000', 'Graphic Design, Photography', NULL, 'Corporate tech buyer', '2026-10-02 11:20:00');

INSERT INTO `registration__logs` (`registration_id`, `email`, `ip_address`, `status`, `registered_at`) VALUES
(1, 'kavitha@example.com', '127.0.0.1', 'Success', '2026-10-12 09:15:00'),
(2, 'suresh.k@example.com', '127.0.0.1', 'Success', '2026-10-12 08:30:00'),
(3, 'rahul@example.com', '127.0.0.1', 'Success', '2026-10-02 11:20:00');

INSERT INTO `personal__info` (`registration_id`, `full_name`, `email`, `phone`, `dob`, `age`, `gender`, `pref_time`, `created_at`) VALUES
(1, 'Kavitha Raman', 'kavitha@example.com', '9876543210', '1998-05-14', 28, 'female', '10:00:00', '2026-10-12 09:15:00'),
(2, 'Suresh Kumar', 'suresh.k@example.com', '9123456789', '1995-11-20', 30, 'male', '14:30:00', '2026-10-12 08:30:00'),
(3, 'Rahul Sharma', 'rahul@example.com', '9845123456', '1996-03-21', 30, 'male', '18:00:00', '2026-10-02 11:20:00');

INSERT INTO `personal__credentials` (`registration_id`, `email`, `password_hash`, `created_at`) VALUES
(1, 'kavitha@example.com', '$2y$10$wK1W2Q6R9h8x5o7y1u3mCeQZc4pG7iL3pA9fB8kH6tM5jP7qW2n4e', '2026-10-12 09:15:00'),
(2, 'suresh.k@example.com', '$2y$10$tZ9A3B5C7D1E3F5G7H9I1J3K5L7M9N1O3P5Q7R9S1T3U5V7W9X1Y3', '2026-10-12 08:30:00'),
(3, 'rahul@example.com', '$2y$10$a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a', '2026-10-02 11:20:00');

INSERT INTO `preferences__address` (`registration_id`, `address`, `city`, `state`, `country`, `created_at`) VALUES
(1, '12 Anna Salai, Guindy', 'Chennai', 'Tamil Nadu', 'India', '2026-10-12 09:15:00'),
(2, '45 Indiranagar 100ft Road', 'Bengaluru', 'Karnataka', 'India', '2026-10-12 08:30:00'),
(3, '88 Bandra West', 'Mumbai', 'Maharashtra', 'India', '2026-10-02 11:20:00');

INSERT INTO `preferences__interests` (`registration_id`, `preferred_categories`, `preferred_brands`, `budget_range`, `interests_skills`, `profile_pic`, `additional_comments`, `created_at`) VALUES
(1, 'Laptops, Audio', 'Apple, Sony', '50000-100000', 'Coding, Audio Mixing', NULL, 'Looking for lightweight laptop for programming', '2026-10-12 09:15:00'),
(2, 'Smartphones, Gaming', 'Samsung, ASUS', '25000-50000', 'Mobile Gaming, Tech Reviews', NULL, 'Interested in 120Hz display phones', '2026-10-12 08:30:00'),
(3, 'Laptops, Accessories', 'Apple, Dell', '50000-100000', 'Graphic Design, Photography', NULL, 'Corporate tech buyer', '2026-10-02 11:20:00');
