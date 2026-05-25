ALTER TABLE mentor_feedback
  ADD COLUMN faculty_mentor_id varchar(20) DEFAULT NULL AFTER company_mentor_id;
