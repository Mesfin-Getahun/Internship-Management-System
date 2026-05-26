ALTER TABLE mentor_feedback
  ADD COLUMN feedback_week int DEFAULT NULL AFTER feedback_type,
  ADD COLUMN week_start_date date DEFAULT NULL AFTER feedback_week,
  ADD COLUMN week_end_date date DEFAULT NULL AFTER week_start_date,
  ADD KEY idx_mentor_feedback_week
    (student_id, internship_id, company_mentor_id, feedback_week);

UPDATE student_internship si
JOIN internship i
  ON si.internship_id = i.internship_id
SET si.start_date = i.start_date
WHERE i.start_date IS NOT NULL
  AND (si.start_date IS NULL OR si.start_date <> i.start_date)
  AND LOWER(COALESCE(si.status, '')) IN ('accepted', 'in progress', 'active');
