const studentProfile = {
  id: "ETS-1234",
  name: "Mesfin Getahun",
  email: "mesfin.getahun@example.com",
  phone: "+251 91 234 5678",
  department: "Software Engineering",
  year: "4th Year",
  cgpa: "3.72",
  skills: ["React", "React Native", "JavaScript", "UI Design", "Git"],
  address: "Bahir Dar, Ethiopia",
  bio: "Frontend-focused student building practical internship workflows for university and industry collaboration.",
  emergencyContact: "Getahun Bekele - +251 92 111 2233",
};

const internshipStatus = {
  company: "Ethio Tech",
  organization: "Ethio Tech",
  position: "Frontend Intern",
  role: "Frontend Intern",
  status: "Waiting",
  duration: "Sep 2026 - Jan 2027",
  supervisorName: "Alemayehu K.",
  period: "Monday - Friday, 8:30 AM - 5:00 PM",
};

const attendance = {
  present: 20,
  absent: 2,
};

const latestReport = {
  message:
    "Mesfin is quickly adapting to our frontend stack and consistently delivers polished interface improvements.",
  supervisorName: "Alemayehu K.",
  date: "Mar 20, 2026",
};

const documents = [
  {
    id: "doc-1",
    title: "Recommendation Letter",
    status: "Available",
    issuedBy: "UIL Office",
    updatedAt: "Apr 2, 2026",
    format: "PDF",
  },
  {
    id: "doc-2",
    title: "Acceptance Letter",
    status: "Available",
    issuedBy: "Ethio Tech",
    updatedAt: "Apr 4, 2026",
    format: "PDF",
  },
  {
    id: "doc-3",
    title: "Evaluation Form",
    status: "Not Available",
    issuedBy: "Company Supervisor",
    updatedAt: "Pending",
    format: "PDF",
  },
];

const notifications = [
  {
    id: "not-1",
    icon: "file-text",
    title: "UIL uploaded your recommendation letter.",
    message: "Your recommendation letter is now available in Documents.",
    time: "2h ago",
    unread: true,
  },
  {
    id: "not-2",
    icon: "check-circle",
    title: "Internship application approved.",
    message: "Ethio Tech approved your internship placement request.",
    time: "Yesterday",
    unread: true,
  },
  {
    id: "not-3",
    icon: "commenting",
    title: "Supervisor submitted a feedback report.",
    message: "A new supervisor report has been posted for this week.",
    time: "Mar 20",
    unread: false,
  },
  {
    id: "not-4",
    icon: "calendar-check-o",
    title: "Attendance reminder.",
    message: "Remember to keep your attendance status updated daily.",
    time: "Mar 18",
    unread: false,
  },
];

const opportunities = [
  {
    id: "int-1",
    company: "Ethio Tech",
    role: "Frontend Intern",
    location: "Addis Ababa",
    duration: "4 months",
    description: "Build responsive internal dashboards with React and collaborate with product teams.",
  },
  {
    id: "int-2",
    company: "Blue Nile Systems",
    role: "Mobile App Intern",
    location: "Bahir Dar",
    duration: "3 months",
    description: "Support mobile feature delivery, QA, and design handoff workflows.",
  },
  {
    id: "int-3",
    company: "Abyssinia Digital",
    role: "UI/UX Intern",
    location: "Remote",
    duration: "5 months",
    description: "Design mobile-first experiences and contribute reusable design system patterns.",
  },
];

let sessionState = {
  defaultPassword: "12345678",
  currentPassword: "12345678",
  firstLoginRequired: true,
};

export function getStudentDashboardData() {
  return {
    studentProfile,
    internshipStatus,
    attendance,
    latestReport,
    documents,
    notifications,
    opportunities,
  };
}

export function validateLogin(identifier, password) {
  const normalized = identifier.trim().toLowerCase();
  const validIdentifiers = [
    studentProfile.id.toLowerCase(),
    studentProfile.email.toLowerCase(),
    "mesfin",
  ];

  const isValidUser = validIdentifiers.includes(normalized);
  const isValidPassword = password === sessionState.currentPassword;

  if (!isValidUser || !isValidPassword) {
    return {
      success: false,
      error: "Use Mesfin, ETS-1234, or mesfin.getahun@example.com with the current password.",
    };
  }

  return {
    success: true,
    firstLoginRequired: sessionState.firstLoginRequired,
  };
}

export function updatePassword(currentPassword, newPassword) {
  if (currentPassword !== sessionState.currentPassword) {
    return {
      success: false,
      error: "Current password is incorrect.",
    };
  }

  sessionState.currentPassword = newPassword;
  sessionState.firstLoginRequired = false;

  return { success: true };
}

export function getCurrentPasswordHint() {
  return sessionState.defaultPassword;
}
