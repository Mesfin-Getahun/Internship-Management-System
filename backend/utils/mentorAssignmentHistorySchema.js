import db from "../config/mysql.js";

let mentorAssignmentHistoryPromise = null;

export const ensureMentorAssignmentHistoryTables = async (connection = db) => {
  if (mentorAssignmentHistoryPromise) {
    return mentorAssignmentHistoryPromise;
  }

  mentorAssignmentHistoryPromise = (async () => {
    await connection.query(`
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
      )
    `);

    await connection.query(`
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
      )
    `);
  })().catch((error) => {
    mentorAssignmentHistoryPromise = null;
    throw error;
  });

  return mentorAssignmentHistoryPromise;
};

export const recordFacultyMentorAssignment = async ({
  connection = db,
  studentId,
  oldMentorId = null,
  newMentorId = null,
  changedByFacultyId = null,
  action,
}) => {
  await ensureMentorAssignmentHistoryTables();

  await connection.query(
    `
    INSERT INTO faculty_mentor_assignment_history
      (student_id, old_mentor_id, new_mentor_id, changed_by_faculty_id, action)
    VALUES (?, ?, ?, ?, ?)
    `,
    [studentId, oldMentorId, newMentorId, changedByFacultyId, action],
  );
};

export const recordCompanyMentorAssignment = async ({
  connection = db,
  studentInternshipId,
  studentId,
  internshipId = null,
  companyId = null,
  oldCompanyMentorId = null,
  newCompanyMentorId = null,
  changedByCompanyId = null,
  action,
}) => {
  await ensureMentorAssignmentHistoryTables();

  await connection.query(
    `
    INSERT INTO company_mentor_assignment_history
      (student_internship_id, student_id, internship_id, company_id,
       old_company_mentor_id, new_company_mentor_id, changed_by_company_id, action)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      studentInternshipId,
      studentId,
      internshipId,
      companyId,
      oldCompanyMentorId,
      newCompanyMentorId,
      changedByCompanyId,
      action,
    ],
  );
};
