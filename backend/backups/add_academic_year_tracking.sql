CREATE TABLE IF NOT EXISTS academic_year (
  academic_year_id INT NOT NULL AUTO_INCREMENT,
  label VARCHAR(20) NOT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  status ENUM('current', 'archived') NOT NULL DEFAULT 'current',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  archived_at DATETIME NULL,
  PRIMARY KEY (academic_year_id),
  UNIQUE KEY uq_academic_year_label (label)
);

ALTER TABLE student_internship
  ADD COLUMN academic_year_id INT NULL,
  ADD COLUMN cohort_status ENUM('current', 'archived') NOT NULL DEFAULT 'current',
  ADD KEY idx_student_internship_academic_year (academic_year_id),
  ADD CONSTRAINT fk_student_internship_academic_year
    FOREIGN KEY (academic_year_id) REFERENCES academic_year (academic_year_id);

INSERT INTO academic_year (label, start_date, end_date, status)
SELECT
  CASE
    WHEN MONTH(CURDATE()) >= 9 THEN CONCAT(YEAR(CURDATE()), '/', YEAR(CURDATE()) + 1)
    ELSE CONCAT(YEAR(CURDATE()) - 1, '/', YEAR(CURDATE()))
  END,
  CASE
    WHEN MONTH(CURDATE()) >= 9 THEN MAKEDATE(YEAR(CURDATE()), 1) + INTERVAL 8 MONTH
    ELSE MAKEDATE(YEAR(CURDATE()) - 1, 1) + INTERVAL 8 MONTH
  END,
  CASE
    WHEN MONTH(CURDATE()) >= 9 THEN MAKEDATE(YEAR(CURDATE()) + 1, 1) + INTERVAL 7 MONTH + INTERVAL 30 DAY
    ELSE MAKEDATE(YEAR(CURDATE()), 1) + INTERVAL 7 MONTH + INTERVAL 30 DAY
  END,
  'current'
WHERE NOT EXISTS (SELECT 1 FROM academic_year WHERE status = 'current');

UPDATE student_internship
SET academic_year_id = (SELECT academic_year_id FROM academic_year WHERE status = 'current' ORDER BY academic_year_id DESC LIMIT 1)
WHERE academic_year_id IS NULL;
