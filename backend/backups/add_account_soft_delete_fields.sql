ALTER TABLE mentor
  ADD COLUMN account_status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  ADD COLUMN deleted_at DATETIME NULL,
  ADD COLUMN deleted_by VARCHAR(100) NULL,
  ADD COLUMN delete_reason TEXT NULL;

ALTER TABLE faculty
  ADD COLUMN account_status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  ADD COLUMN deleted_at DATETIME NULL,
  ADD COLUMN deleted_by VARCHAR(100) NULL,
  ADD COLUMN delete_reason TEXT NULL;

ALTER TABLE company_mentor
  ADD COLUMN account_status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  ADD COLUMN deleted_at DATETIME NULL,
  ADD COLUMN deleted_by VARCHAR(100) NULL,
  ADD COLUMN delete_reason TEXT NULL;

ALTER TABLE company
  ADD COLUMN account_status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  ADD COLUMN deleted_at DATETIME NULL,
  ADD COLUMN deleted_by VARCHAR(100) NULL,
  ADD COLUMN delete_reason TEXT NULL;
