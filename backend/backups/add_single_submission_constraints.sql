-- Enforce one-time submissions for internship workflow records.
-- Run this after taking a database backup. It archives duplicate rows before
-- deleting them, then adds unique keys for the rows that must be one-per-pair.

START TRANSACTION;

CREATE TABLE IF NOT EXISTS application_duplicate_archive LIKE application;
CREATE TEMPORARY TABLE keep_application_ids AS
SELECT application_id
FROM (
  SELECT
    application_id,
    ROW_NUMBER() OVER (
      PARTITION BY student_id, internship_id
      ORDER BY
        CASE LOWER(COALESCE(status, ''))
          WHEN 'accepted' THEN 5
          WHEN 'pending' THEN 4
          WHEN 'withdrawn' THEN 3
          WHEN 'cancelled' THEN 2
          WHEN 'rejected' THEN 1
          ELSE 0
        END DESC,
        application_id DESC
    ) AS row_rank
  FROM application
  WHERE student_id IS NOT NULL
    AND internship_id IS NOT NULL
) ranked
WHERE row_rank = 1;

INSERT INTO application_duplicate_archive
SELECT application.*
FROM application
LEFT JOIN keep_application_ids
  ON keep_application_ids.application_id = application.application_id
WHERE keep_application_ids.application_id IS NULL
  AND application.student_id IS NOT NULL
  AND application.internship_id IS NOT NULL;

DELETE application
FROM application
LEFT JOIN keep_application_ids
  ON keep_application_ids.application_id = application.application_id
WHERE keep_application_ids.application_id IS NULL
  AND application.student_id IS NOT NULL
  AND application.internship_id IS NOT NULL;

ALTER TABLE application
  ADD UNIQUE KEY uq_application_student_internship (student_id, internship_id);

CREATE TABLE IF NOT EXISTS internship_report_duplicate_archive LIKE internship_report;
CREATE TEMPORARY TABLE keep_report_ids AS
SELECT report_id
FROM (
  SELECT
    report_id,
    ROW_NUMBER() OVER (
      PARTITION BY student_id, internship_id
      ORDER BY
        CASE LOWER(COALESCE(status, ''))
          WHEN 'faculty_submitted' THEN 4
          WHEN 'approved' THEN 3
          WHEN 'signed' THEN 2
          WHEN 'submitted' THEN 1
          ELSE 0
        END DESC,
        COALESCE(faculty_submitted_at, signed_at, submission_date) DESC,
        report_id DESC
    ) AS row_rank
  FROM internship_report
  WHERE student_id IS NOT NULL
    AND internship_id IS NOT NULL
) ranked
WHERE row_rank = 1;

INSERT INTO internship_report_duplicate_archive
SELECT internship_report.*
FROM internship_report
LEFT JOIN keep_report_ids
  ON keep_report_ids.report_id = internship_report.report_id
WHERE keep_report_ids.report_id IS NULL
  AND internship_report.student_id IS NOT NULL
  AND internship_report.internship_id IS NOT NULL;

DELETE internship_report
FROM internship_report
LEFT JOIN keep_report_ids
  ON keep_report_ids.report_id = internship_report.report_id
WHERE keep_report_ids.report_id IS NULL
  AND internship_report.student_id IS NOT NULL
  AND internship_report.internship_id IS NOT NULL;

ALTER TABLE internship_report
  ADD UNIQUE KEY uq_report_student_internship (student_id, internship_id);

CREATE TABLE IF NOT EXISTS internship_evaluation_duplicate_archive LIKE internship_evaluation;
CREATE TEMPORARY TABLE keep_evaluation_ids AS
SELECT evaluation_id
FROM (
  SELECT
    evaluation_id,
    ROW_NUMBER() OVER (
      PARTITION BY student_id, internship_id
      ORDER BY submitted_at DESC, evaluation_id DESC
    ) AS row_rank
  FROM internship_evaluation
  WHERE student_id IS NOT NULL
    AND internship_id IS NOT NULL
) ranked
WHERE row_rank = 1;

INSERT INTO internship_evaluation_duplicate_archive
SELECT internship_evaluation.*
FROM internship_evaluation
LEFT JOIN keep_evaluation_ids
  ON keep_evaluation_ids.evaluation_id = internship_evaluation.evaluation_id
WHERE keep_evaluation_ids.evaluation_id IS NULL
  AND internship_evaluation.student_id IS NOT NULL
  AND internship_evaluation.internship_id IS NOT NULL;

DELETE internship_evaluation
FROM internship_evaluation
LEFT JOIN keep_evaluation_ids
  ON keep_evaluation_ids.evaluation_id = internship_evaluation.evaluation_id
WHERE keep_evaluation_ids.evaluation_id IS NULL
  AND internship_evaluation.student_id IS NOT NULL
  AND internship_evaluation.internship_id IS NOT NULL;

ALTER TABLE internship_evaluation
  ADD UNIQUE KEY uq_evaluation_student_internship (student_id, internship_id);

CREATE TABLE IF NOT EXISTS student_internship_duplicate_archive LIKE student_internship;
CREATE TEMPORARY TABLE keep_student_internship_ids AS
SELECT id
FROM (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY student_id, internship_id, academic_year_id
      ORDER BY
        CASE LOWER(COALESCE(cohort_status, ''))
          WHEN 'current' THEN 2
          ELSE 1
        END DESC,
        CASE LOWER(COALESCE(status, ''))
          WHEN 'in progress' THEN 5
          WHEN 'active' THEN 4
          WHEN 'accepted' THEN 3
          WHEN 'completed' THEN 2
          WHEN 'complete' THEN 2
          ELSE 1
        END DESC,
        id DESC
    ) AS row_rank
  FROM student_internship
  WHERE student_id IS NOT NULL
    AND internship_id IS NOT NULL
) ranked
WHERE row_rank = 1;

INSERT INTO student_internship_duplicate_archive
SELECT student_internship.*
FROM student_internship
LEFT JOIN keep_student_internship_ids
  ON keep_student_internship_ids.id = student_internship.id
WHERE keep_student_internship_ids.id IS NULL
  AND student_internship.student_id IS NOT NULL
  AND student_internship.internship_id IS NOT NULL;

DELETE student_internship
FROM student_internship
LEFT JOIN keep_student_internship_ids
  ON keep_student_internship_ids.id = student_internship.id
WHERE keep_student_internship_ids.id IS NULL
  AND student_internship.student_id IS NOT NULL
  AND student_internship.internship_id IS NOT NULL;

ALTER TABLE student_internship
  ADD UNIQUE KEY uq_student_internship_academic_year (student_id, internship_id, academic_year_id);

CREATE TABLE IF NOT EXISTS payments_duplicate_archive LIKE payments;
CREATE TEMPORARY TABLE keep_payment_ids AS
SELECT payment_id
FROM (
  SELECT
    payment_id,
    ROW_NUMBER() OVER (
      PARTITION BY student_id
      ORDER BY payment_id DESC
    ) AS row_rank
  FROM payments
  WHERE student_id IS NOT NULL
) ranked
WHERE row_rank = 1;

INSERT INTO payments_duplicate_archive
SELECT payments.*
FROM payments
LEFT JOIN keep_payment_ids
  ON keep_payment_ids.payment_id = payments.payment_id
WHERE keep_payment_ids.payment_id IS NULL
  AND payments.student_id IS NOT NULL;

DELETE payments
FROM payments
LEFT JOIN keep_payment_ids
  ON keep_payment_ids.payment_id = payments.payment_id
WHERE keep_payment_ids.payment_id IS NULL
  AND payments.student_id IS NOT NULL;

ALTER TABLE payments
  ADD UNIQUE KEY uq_payments_student (student_id);

COMMIT;
