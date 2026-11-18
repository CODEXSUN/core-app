-- Empty compatibility schema for disposable tests only; no application migrations.
CREATE TABLE `core_address_types` (
  `uuid` char(8) NOT NULL DEFAULT lcase(substr(md5(uuid()),1,8)),
  `created_by` varchar(191) NOT NULL DEFAULT 'system:migration',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` varchar(24) NOT NULL DEFAULT 'active',
  `sort_order` int(11) NOT NULL DEFAULT 1000,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `address_types_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `core_bank_names` (
  `uuid` char(8) NOT NULL DEFAULT lcase(substr(md5(uuid()),1,8)),
  `created_by` varchar(191) NOT NULL DEFAULT 'system:migration',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` varchar(24) NOT NULL DEFAULT 'active',
  `sort_order` int(11) NOT NULL DEFAULT 1000,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `bank_names_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `core_cities` (
  `uuid` char(8) NOT NULL DEFAULT lcase(substr(md5(uuid()),1,8)),
  `created_by` varchar(191) NOT NULL DEFAULT 'system:migration',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `district_id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 1000,
  `status` varchar(24) NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `cities_district_name_unique` (`district_id`,`name`),
  KEY `cities_district_id_idx` (`district_id`),
  CONSTRAINT `cities_district_id_fk` FOREIGN KEY (`district_id`) REFERENCES `core_districts` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `core_contact_groups` (
  `uuid` char(8) NOT NULL DEFAULT lcase(substr(md5(uuid()),1,8)),
  `created_by` varchar(191) NOT NULL DEFAULT 'system:migration',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` varchar(24) NOT NULL DEFAULT 'active',
  `sort_order` int(11) NOT NULL DEFAULT 1000,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `contact_groups_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `core_contact_types` (
  `uuid` char(8) NOT NULL DEFAULT lcase(substr(md5(uuid()),1,8)),
  `created_by` varchar(191) NOT NULL DEFAULT 'system:migration',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` varchar(24) NOT NULL DEFAULT 'active',
  `sort_order` int(11) NOT NULL DEFAULT 1000,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `contact_types_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `core_contacts` (
  `created_by` varchar(191) NOT NULL DEFAULT 'system:migration',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` char(8) NOT NULL DEFAULT lcase(substr(md5(uuid()),1,8)),
  `code` varchar(80) NOT NULL,
  `name` varchar(191) NOT NULL,
  `legal_name` varchar(191) DEFAULT NULL,
  `type_id` int(11) DEFAULT NULL,
  `type_name` varchar(191) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `group_name` varchar(191) DEFAULT NULL,
  `primary_phone` varchar(80) DEFAULT NULL,
  `primary_email` varchar(191) DEFAULT NULL,
  `gstin` varchar(40) DEFAULT NULL,
  `pan` varchar(40) DEFAULT NULL,
  `msme_no` varchar(80) DEFAULT NULL,
  `msme_category` varchar(80) DEFAULT NULL,
  `tan_no` varchar(80) DEFAULT NULL,
  `tds_available` tinyint(1) NOT NULL DEFAULT 0,
  `tcs_available` tinyint(1) NOT NULL DEFAULT 0,
  `opening_balance` decimal(18,2) NOT NULL DEFAULT 0.00,
  `credit_limit` decimal(18,2) NOT NULL DEFAULT 0.00,
  `website` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(24) NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `contacts_code_unique` (`code`),
  KEY `contacts_status_name` (`status`,`name`),
  KEY `contacts_type` (`type_id`),
  KEY `contacts_group` (`group_id`),
  CONSTRAINT `contacts_group_fk` FOREIGN KEY (`group_id`) REFERENCES `core_contact_groups` (`id`),
  CONSTRAINT `contacts_type_fk` FOREIGN KEY (`type_id`) REFERENCES `core_contact_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `core_contacts_addresses` (
  `uuid` char(8) NOT NULL DEFAULT lcase(substr(md5(uuid()),1,8)),
  `status` varchar(24) NOT NULL DEFAULT 'active',
  `created_by` varchar(191) NOT NULL DEFAULT 'system:migration',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL,
  `address_type_id` int(11) DEFAULT NULL,
  `address_type_name` varchar(191) DEFAULT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `country_id` int(11) DEFAULT NULL,
  `country_name` varchar(191) DEFAULT NULL,
  `state_id` int(11) DEFAULT NULL,
  `state_name` varchar(191) DEFAULT NULL,
  `district_id` int(11) DEFAULT NULL,
  `district_name` varchar(191) DEFAULT NULL,
  `city_id` int(11) DEFAULT NULL,
  `city_name` varchar(191) DEFAULT NULL,
  `pincode_id` int(11) DEFAULT NULL,
  `pincode_name` varchar(80) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `contacts_addresses_parent` (`parent_id`,`sort_order`),
  KEY `contacts_addresses_location` (`country_id`,`state_id`,`district_id`,`city_id`,`pincode_id`),
  KEY `contacts_addresses_type_fk` (`address_type_id`),
  KEY `contacts_addresses_state_fk` (`state_id`),
  KEY `contacts_addresses_district_fk` (`district_id`),
  KEY `contacts_addresses_city_fk` (`city_id`),
  KEY `contacts_addresses_pincode_fk` (`pincode_id`),
  CONSTRAINT `contacts_addresses_city_fk` FOREIGN KEY (`city_id`) REFERENCES `core_cities` (`id`),
  CONSTRAINT `contacts_addresses_country_fk` FOREIGN KEY (`country_id`) REFERENCES `core_countries` (`id`),
  CONSTRAINT `contacts_addresses_district_fk` FOREIGN KEY (`district_id`) REFERENCES `core_districts` (`id`),
  CONSTRAINT `contacts_addresses_parent_fk` FOREIGN KEY (`parent_id`) REFERENCES `core_contacts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contacts_addresses_pincode_fk` FOREIGN KEY (`pincode_id`) REFERENCES `core_pincodes` (`id`),
  CONSTRAINT `contacts_addresses_state_fk` FOREIGN KEY (`state_id`) REFERENCES `core_states` (`id`),
  CONSTRAINT `contacts_addresses_type_fk` FOREIGN KEY (`address_type_id`) REFERENCES `core_address_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `core_contacts_bank_accounts` (
  `uuid` char(8) NOT NULL DEFAULT lcase(substr(md5(uuid()),1,8)),
  `status` varchar(24) NOT NULL DEFAULT 'active',
  `created_by` varchar(191) NOT NULL DEFAULT 'system:migration',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL,
  `bank_name_id` int(11) DEFAULT NULL,
  `bank_name` varchar(191) DEFAULT NULL,
  `account_type` varchar(80) DEFAULT NULL,
  `account_number` varchar(120) NOT NULL,
  `holder_name` varchar(191) DEFAULT NULL,
  `ifsc` varchar(40) DEFAULT NULL,
  `branch` varchar(191) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `contacts_bank_accounts_parent` (`parent_id`,`sort_order`),
  KEY `contacts_bank_accounts_bank` (`bank_name_id`),
  CONSTRAINT `contacts_bank_accounts_bank_fk` FOREIGN KEY (`bank_name_id`) REFERENCES `core_bank_names` (`id`),
  CONSTRAINT `contacts_bank_accounts_parent_fk` FOREIGN KEY (`parent_id`) REFERENCES `core_contacts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `core_contacts_emails` (
  `uuid` char(8) NOT NULL DEFAULT lcase(substr(md5(uuid()),1,8)),
  `status` varchar(24) NOT NULL DEFAULT 'active',
  `created_by` varchar(191) NOT NULL DEFAULT 'system:migration',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `email_type` varchar(80) NOT NULL DEFAULT 'Primary',
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `contacts_emails_parent` (`parent_id`,`sort_order`),
  CONSTRAINT `contacts_emails_parent_fk` FOREIGN KEY (`parent_id`) REFERENCES `core_contacts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `core_contacts_phones` (
  `uuid` char(8) NOT NULL DEFAULT lcase(substr(md5(uuid()),1,8)),
  `status` varchar(24) NOT NULL DEFAULT 'active',
  `created_by` varchar(191) NOT NULL DEFAULT 'system:migration',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL,
  `phone` varchar(80) NOT NULL,
  `phone_type` varchar(80) NOT NULL DEFAULT 'Mobile',
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `contacts_phones_parent` (`parent_id`,`sort_order`),
  CONSTRAINT `contacts_phones_parent_fk` FOREIGN KEY (`parent_id`) REFERENCES `core_contacts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `core_contacts_social_links` (
  `uuid` char(8) NOT NULL DEFAULT lcase(substr(md5(uuid()),1,8)),
  `created_by` varchar(191) NOT NULL DEFAULT 'system:migration',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL,
  `platform` varchar(80) NOT NULL,
  `url` varchar(255) NOT NULL,
  `status` varchar(24) NOT NULL DEFAULT 'active',
  `sort_order` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `contacts_social_links_parent` (`parent_id`,`sort_order`),
  CONSTRAINT `contacts_social_links_parent_fk` FOREIGN KEY (`parent_id`) REFERENCES `core_contacts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `core_countries` (
  `uuid` char(8) NOT NULL DEFAULT lcase(substr(md5(uuid()),1,8)),
  `created_by` varchar(191) NOT NULL DEFAULT 'system:migration',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(80) NOT NULL,
  `name` varchar(200) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 1000,
  `status` varchar(24) NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `countries_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `core_districts` (
  `uuid` char(8) NOT NULL DEFAULT lcase(substr(md5(uuid()),1,8)),
  `created_by` varchar(191) NOT NULL DEFAULT 'system:migration',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `state_id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 1000,
  `status` varchar(24) NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `districts_state_name_unique` (`state_id`,`name`),
  KEY `districts_state_id_idx` (`state_id`),
  CONSTRAINT `districts_state_id_fk` FOREIGN KEY (`state_id`) REFERENCES `core_states` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `core_pincodes` (
  `uuid` char(8) NOT NULL DEFAULT lcase(substr(md5(uuid()),1,8)),
  `created_by` varchar(191) NOT NULL DEFAULT 'system:migration',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `city_id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `area` varchar(200) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 1000,
  `status` varchar(24) NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `pincodes_city_name_area_unique` (`city_id`,`name`,`area`),
  KEY `pincodes_city_id_idx` (`city_id`),
  CONSTRAINT `pincodes_city_id_fk` FOREIGN KEY (`city_id`) REFERENCES `core_cities` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `core_states` (
  `uuid` char(8) NOT NULL DEFAULT lcase(substr(md5(uuid()),1,8)),
  `created_by` varchar(191) NOT NULL DEFAULT 'system:migration',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `country_id` int(11) NOT NULL,
  `code` varchar(80) NOT NULL,
  `name` varchar(200) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 1000,
  `status` varchar(24) NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `states_country_code_unique` (`country_id`,`code`),
  UNIQUE KEY `states_country_name_unique` (`country_id`,`name`),
  KEY `states_country_id_idx` (`country_id`),
  CONSTRAINT `states_country_id_fk` FOREIGN KEY (`country_id`) REFERENCES `core_countries` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
