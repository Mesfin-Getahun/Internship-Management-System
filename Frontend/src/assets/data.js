// Mock users and related entities for local testing

export const users = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    username: "admin",
    password: "admin@123@123", 
    role: "admin",
  },
  {
    id: 2,
    name: "Faculty User",
    email: "faculty@example.com",
    username: "faculty1",
    password: "faculty123@123",
    role: "faculty",
  },
  {
    id: 3,
    name: "Mentor User",
    email: "mentor@example.com",
    username: "mentor1",
    password: "mentor@123@123",
    role: "mentor",
  },
  {
    id: 4,
    name: "UIL Officer",
    email: "uil@example.com",
    username: "uil1",
    password: "uil123@123",
    role: "uil",
  },
  {
    id: 5,
    name: "Student User",
    email: "welde@example.com",
    username: "student1",
    password: "password123",
    role: "student",
  },
  {
    id: 6,
    name: "Org Admin",
    email: "orgadmin@example.com",
    username: "orgadmin",
    password: "org123",
    role: "organization",
  },
];

// Example mock organizations (for org dashboard / signup tests)
export const organizations = [
  {
    id: 1,
    name: "Tech Innovators PLC",
    type: "Private",
    industry: "Software Development",
    city: "Addis Ababa",
    region: "Addis Ababa",
    phone: "+251-911-000000",
    email: "contact@techinnovators.com",
  },
];

// Example internship postings
export const internships = [
  {
    id: 1,
    orgId: 1,
    title: "Frontend Developer Intern",
    field: "Software Engineering",
    description: "Work with React and Tailwind to build dashboards.",
    location: "Addis Ababa",
    slots: 5,
  },
];
