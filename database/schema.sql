SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_salt VARCHAR(64) NOT NULL,
  password_hash VARCHAR(256) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  role ENUM('admin','operator','viewer') NOT NULL DEFAULT 'operator',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS incidents (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  severity ENUM('critical','medical','amber','info') NOT NULL DEFAULT 'amber',
  category VARCHAR(60) NOT NULL DEFAULT 'general',
  tag VARCHAR(160) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  sinhala_text TEXT NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  location_label VARCHAR(180) NULL,
  action_label VARCHAR(120) NULL,
  icon VARCHAR(40) NOT NULL DEFAULT 'alerts',
  status ENUM('open','dispatched','resolved') NOT NULL DEFAULT 'open',
  created_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_incident_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_incident_status (status),
  INDEX idx_incident_severity (severity),
  INDEX idx_incident_category (category),
  INDEX idx_incident_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dispatches (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  incident_id INT UNSIGNED NULL,
  action_type ENUM('incident','quick') NOT NULL DEFAULT 'incident',
  action_label VARCHAR(160) NOT NULL,
  requested_by INT UNSIGNED NULL,
  status ENUM('requested','acknowledged','in_progress','completed','cancelled') NOT NULL DEFAULT 'requested',
  details_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  CONSTRAINT fk_dispatch_incident FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE SET NULL,
  CONSTRAINT fk_dispatch_user FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_dispatch_created (created_at),
  INDEX idx_dispatch_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
  unit VARCHAR(30) NOT NULL DEFAULT 'units',
  reorder_level DECIMAL(12,2) NOT NULL DEFAULT 0,
  location VARCHAR(160) NOT NULL DEFAULT 'Central Store',
  status ENUM('ok','low','out') NOT NULL DEFAULT 'ok',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_inventory_category (category),
  INDEX idx_inventory_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS volunteers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(60) NOT NULL UNIQUE,
  full_name VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NULL,
  skills VARCHAR(255) NULL,
  district VARCHAR(100) NULL,
  status ENUM('available','assigned','off_duty') NOT NULL DEFAULT 'available',
  assigned_unit VARCHAR(160) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_volunteer_status (status),
  INDEX idx_volunteer_district (district)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS field_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  unit_name VARCHAR(160) NOT NULL,
  location VARCHAR(180) NULL,
  level ENUM('info','warning','critical') NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  created_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fieldlog_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_fieldlog_created (created_at),
  INDEX idx_fieldlog_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS response_units (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  unit_type VARCHAR(100) NOT NULL,
  readiness_percent TINYINT UNSIGNED NOT NULL DEFAULT 0,
  status VARCHAR(60) NOT NULL DEFAULT 'STANDBY',
  location VARCHAR(160) NULL,
  capacity INT UNSIGNED NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_readiness CHECK (readiness_percent <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_metrics (
  id TINYINT UNSIGNED PRIMARY KEY,
  distress_beacons INT UNSIGNED NOT NULL DEFAULT 0,
  safe_civilians INT UNSIGNED NOT NULL DEFAULT 0,
  mobile_units INT UNSIGNED NOT NULL DEFAULT 0,
  mesh_latency_ms DECIMAL(6,2) NOT NULL DEFAULT 0,
  mesh_nodes INT UNSIGNED NOT NULL DEFAULT 0,
  websocket_latency_ms DECIMAL(6,2) NOT NULL DEFAULT 0,
  packet_loss DECIMAL(6,3) NOT NULL DEFAULT 0,
  radio_band VARCHAR(80) NOT NULL DEFAULT 'BAND 14 LMR',
  radio_frequency VARCHAR(40) NOT NULL DEFAULT '782.4 MHz',
  tidal_crest_seconds INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alerts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type ENUM('siren','sos','system') NOT NULL,
  message VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  triggered_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_alert_user FOREIGN KEY (triggered_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_alert_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
