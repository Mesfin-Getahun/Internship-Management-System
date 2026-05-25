ALTER TABLE company_mentor
  ADD COLUMN company_id int DEFAULT NULL AFTER company_mentor_id;

CREATE INDEX idx_company_mentor_company_id
  ON company_mentor (company_id);

CREATE TABLE IF NOT EXISTS faculty_mentor_assignment_history (
  history_id int NOT NULL AUTO_INCREMENT,
  student_id varchar(20) NOT NULL,
  old_mentor_id varchar(20) DEFAULT NULL,
  new_mentor_id varchar(20) DEFAULT NULL,
  changed_by_faculty_id varchar(20) DEFAULT NULL,
  action varchar(30) NOT NULL,
  changed_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (history_id),
  KEY idx_faculty_mentor_history_student (student_id),
  KEY idx_faculty_mentor_history_old (old_mentor_id),
  KEY idx_faculty_mentor_history_new (new_mentor_id)
);

CREATE TABLE IF NOT EXISTS company_mentor_assignment_history (
  history_id int NOT NULL AUTO_INCREMENT,
  student_internship_id int NOT NULL,
  student_id varchar(20) NOT NULL,
  internship_id int DEFAULT NULL,
  company_id int DEFAULT NULL,
  old_company_mentor_id varchar(20) DEFAULT NULL,
  new_company_mentor_id varchar(20) DEFAULT NULL,
  changed_by_company_id int DEFAULT NULL,
  action varchar(30) NOT NULL,
  changed_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (history_id),
  KEY idx_company_mentor_history_placement (student_internship_id),
  KEY idx_company_mentor_history_student (student_id),
  KEY idx_company_mentor_history_old (old_company_mentor_id),
  KEY idx_company_mentor_history_new (new_company_mentor_id)
);
