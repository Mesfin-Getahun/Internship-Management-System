let evaluatorSchemaPromise = null;

const ensureEvaluatorTables = async (db) => {
  if (evaluatorSchemaPromise) {
    return evaluatorSchemaPromise;
  }

  evaluatorSchemaPromise = (async () => {
    await db.query(`
      CREATE TABLE IF NOT EXISTS evaluator (
        evaluator_id varchar(20) NOT NULL,
        faculty_name varchar(255) NOT NULL,
        full_name varchar(255) NOT NULL,
        email varchar(255) NOT NULL,
        phone_number varchar(50) DEFAULT NULL,
        password varchar(255) NOT NULL,
        must_change_password tinyint(1) DEFAULT 1,
        account_status varchar(20) DEFAULT 'active',
        created_by_faculty_id varchar(20) DEFAULT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (evaluator_id),
        UNIQUE KEY uq_evaluator_email (email),
        KEY idx_evaluator_faculty (faculty_name)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS presentation_evaluator_assignment (
        assignment_id int NOT NULL AUTO_INCREMENT,
        student_id varchar(20) NOT NULL,
        internship_id int NOT NULL,
        faculty_name varchar(255) NOT NULL,
        evaluator_id varchar(20) NOT NULL,
        assigned_by_faculty_id varchar(20) DEFAULT NULL,
        assigned_at timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (assignment_id),
        UNIQUE KEY uq_presentation_assignment (student_id, internship_id, evaluator_id),
        KEY idx_presentation_assignment_student (student_id, internship_id),
        KEY idx_presentation_assignment_evaluator (evaluator_id),
        CONSTRAINT fk_presentation_assignment_evaluator
          FOREIGN KEY (evaluator_id) REFERENCES evaluator(evaluator_id)
          ON DELETE CASCADE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS presentation_grade (
        grade_id int NOT NULL AUTO_INCREMENT,
        student_id varchar(20) NOT NULL,
        internship_id int NOT NULL,
        evaluator_id varchar(20) NOT NULL,
        mark decimal(5,2) NOT NULL,
        submitted_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (grade_id),
        UNIQUE KEY uq_presentation_grade (student_id, internship_id, evaluator_id),
        KEY idx_presentation_grade_student (student_id, internship_id),
        CONSTRAINT fk_presentation_grade_evaluator
          FOREIGN KEY (evaluator_id) REFERENCES evaluator(evaluator_id)
          ON DELETE CASCADE
      )
    `);
  })().catch((error) => {
    evaluatorSchemaPromise = null;
    throw error;
  });

  return evaluatorSchemaPromise;
};

const normalizePresentationMark = (value) => {
  const mark = Number(value);
  if (!Number.isFinite(mark) || mark < 0 || mark > 30) {
    return null;
  }

  return Math.round(mark * 100) / 100;
};

const getPresentationStatus = (grades) => {
  if (!Array.isArray(grades) || grades.length === 0) {
    return { status: "pending", finalMark: null };
  }

  const uniqueMarks = Array.from(new Set(grades.map((grade) => Number(grade.mark))));

  if (grades.length >= 2 && uniqueMarks.length === 1) {
    return { status: "agreed", finalMark: uniqueMarks[0] };
  }

  if (grades.length >= 2) {
    return { status: "disputed", finalMark: null };
  }

  return { status: "pending", finalMark: null };
};

export {
  ensureEvaluatorTables,
  getPresentationStatus,
  normalizePresentationMark,
};
