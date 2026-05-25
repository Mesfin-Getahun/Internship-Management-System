ALTER TABLE internship_evaluation
  ADD COLUMN company_mentor_id varchar(20) DEFAULT NULL AFTER internship_id;

CREATE INDEX idx_internship_evaluation_company_mentor
  ON internship_evaluation (company_mentor_id);
