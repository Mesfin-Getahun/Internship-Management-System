CREATE TABLE IF NOT EXISTS company_rating (
  rating_id int NOT NULL AUTO_INCREMENT,
  student_id varchar(20) NOT NULL,
  internship_id int NOT NULL,
  company_id int NOT NULL,
  rating tinyint NOT NULL,
  comment text,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (rating_id),
  UNIQUE KEY uq_company_rating_student_internship (student_id, internship_id, company_id),
  KEY idx_company_rating_company (company_id),
  KEY idx_company_rating_student (student_id)
);

CREATE TABLE IF NOT EXISTS company_rating_action (
  action_id int NOT NULL AUTO_INCREMENT,
  company_id int NOT NULL,
  action varchar(30) NOT NULL,
  note text,
  average_rating_snapshot decimal(3,2) DEFAULT NULL,
  total_ratings_snapshot int DEFAULT 0,
  created_by_uil_id varchar(20) DEFAULT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (action_id),
  KEY idx_company_rating_action_company (company_id),
  KEY idx_company_rating_action_created_at (created_at)
);
