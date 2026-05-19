export const ALL_DEPARTMENTS = 'All Departments';

export const getRecordDepartment = (record = {}) =>
  String(record.department || record.dept || '').trim();

export const getDepartmentOptions = (...collections) => {
  const departments = collections
    .flat()
    .map(getRecordDepartment)
    .filter(Boolean);

  return [
    ALL_DEPARTMENTS,
    ...Array.from(new Set(departments)).sort((a, b) => a.localeCompare(b)),
  ];
};

export const matchesDepartment = (record, selectedDepartment) =>
  selectedDepartment === ALL_DEPARTMENTS ||
  getRecordDepartment(record) === selectedDepartment;
