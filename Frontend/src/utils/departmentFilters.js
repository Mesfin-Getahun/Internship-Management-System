export const ALL_DEPARTMENTS = 'All Departments';

const normalizeDepartment = (department) =>
  String(department || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();

export const getRecordDepartment = (record = {}) =>
  String(record.department || record.dept || '').trim();

export const getDepartmentOptions = (...collections) => {
  const departmentsByKey = new Map();

  collections
    .flat()
    .map(getRecordDepartment)
    .forEach((department) => {
      const key = normalizeDepartment(department);
      if (key && !departmentsByKey.has(key)) {
        departmentsByKey.set(key, department.replace(/\s+/g, ' '));
      }
    });

  return [
    ALL_DEPARTMENTS,
    ...Array.from(departmentsByKey.values()).sort((a, b) => a.localeCompare(b)),
  ];
};

export const matchesDepartment = (record, selectedDepartment) =>
  selectedDepartment === ALL_DEPARTMENTS ||
  normalizeDepartment(getRecordDepartment(record)) === normalizeDepartment(selectedDepartment);
