const ACCOUNT_ROLE_CONFIG = Object.freeze({
  student: {
    table: "student",
    idColumn: "student_id",
    normalizedRole: "student",
  },
  admin: {
    table: "admin",
    idColumn: "admin_id",
    normalizedRole: "admin",
  },
  mentor: {
    table: "mentor",
    idColumn: "mentor_id",
    normalizedRole: "mentor",
  },
  faculty: {
    table: "faculty",
    idColumn: "faculty_id",
    normalizedRole: "faculty",
  },
  uil: {
    table: "UIL",
    idColumn: "UIL_id",
    normalizedRole: "UIL",
  },
  company_mentor: {
    table: "company_mentor",
    idColumn: "company_mentor_id",
    normalizedRole: "company_mentor",
  },
  evaluator: {
    table: "evaluator",
    idColumn: "evaluator_id",
    normalizedRole: "evaluator",
  },
  company: {
    table: "company",
    idColumn: "company_id",
    normalizedRole: "company",
  },
});

export const resolveAccountRole = (role) => {
  if (!role) return null;
  return ACCOUNT_ROLE_CONFIG[String(role).trim().toLowerCase()] || null;
};

export default ACCOUNT_ROLE_CONFIG;
