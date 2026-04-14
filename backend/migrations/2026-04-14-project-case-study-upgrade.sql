ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS slug VARCHAR(180) NULL AFTER title,
  ADD COLUMN IF NOT EXISTS case_study_summary TEXT NULL AFTER description,
  ADD COLUMN IF NOT EXISTS role VARCHAR(120) NULL AFTER case_study_summary,
  ADD COLUMN IF NOT EXISTS team_size VARCHAR(80) NULL AFTER role,
  ADD COLUMN IF NOT EXISTS duration VARCHAR(120) NULL AFTER team_size,
  ADD COLUMN IF NOT EXISTS problem TEXT NULL AFTER duration,
  ADD COLUMN IF NOT EXISTS solution TEXT NULL AFTER problem,
  ADD COLUMN IF NOT EXISTS impact TEXT NULL AFTER solution,
  ADD COLUMN IF NOT EXISTS architecture TEXT NULL AFTER impact,
  ADD COLUMN IF NOT EXISTS gallery_json LONGTEXT NULL AFTER image_url,
  ADD COLUMN IF NOT EXISTS challenges_json LONGTEXT NULL AFTER gallery_json,
  ADD COLUMN IF NOT EXISTS learnings_json LONGTEXT NULL AFTER challenges_json,
  ADD COLUMN IF NOT EXISTS featured TINYINT(1) NOT NULL DEFAULT 0 AFTER learnings_json,
  ADD COLUMN IF NOT EXISTS status ENUM('draft', 'published') NOT NULL DEFAULT 'published' AFTER featured,
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0 AFTER status,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

UPDATE projects
SET slug = CONCAT('project-', id)
WHERE slug IS NULL OR slug = '';

ALTER TABLE projects
  MODIFY COLUMN slug VARCHAR(180) NOT NULL,
  ADD UNIQUE KEY unique_projects_slug (slug);

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS is_read TINYINT(1) NOT NULL DEFAULT 0 AFTER message,
  ADD COLUMN IF NOT EXISTS read_at DATETIME NULL AFTER is_read;

CREATE TABLE IF NOT EXISTS analytics_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(60) NOT NULL,
  page_path VARCHAR(255) NULL,
  project_slug VARCHAR(180) NULL,
  metadata_json LONGTEXT NULL,
  referrer VARCHAR(255) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_analytics_event_type (event_type),
  INDEX idx_analytics_project_slug (project_slug),
  INDEX idx_analytics_created_at (created_at)
);
