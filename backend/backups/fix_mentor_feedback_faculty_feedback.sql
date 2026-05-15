ALTER TABLE mentor_feedback
  ADD COLUMN parent_feedback_id int DEFAULT NULL AFTER company_mentor_id,
  ADD KEY parent_feedback_id (parent_feedback_id),
  MODIFY company_mentor_id varchar(20) DEFAULT NULL,
  MODIFY feedback_type enum('weekly','midterm','final','faculty') DEFAULT 'weekly';
