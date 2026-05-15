UPDATE mentor_feedback faculty_feedback
SET parent_feedback_id = (
  SELECT matched_company_feedback.feedback_id
  FROM (
    SELECT feedback_id, student_id, internship_id, created_at
    FROM mentor_feedback
    WHERE company_mentor_id IS NOT NULL
  ) matched_company_feedback
  WHERE matched_company_feedback.student_id = faculty_feedback.student_id
    AND matched_company_feedback.internship_id = faculty_feedback.internship_id
    AND matched_company_feedback.created_at <= faculty_feedback.created_at
  ORDER BY matched_company_feedback.created_at DESC, matched_company_feedback.feedback_id DESC
  LIMIT 1
)
WHERE faculty_feedback.company_mentor_id IS NULL
  AND faculty_feedback.parent_feedback_id IS NULL;
