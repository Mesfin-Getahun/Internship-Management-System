import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import StudentNavbar from "../../components/dashboard/student/StudentNavbar.jsx";
import StudentSidebar from "../../components/dashboard/student/StudentSidebar.jsx";
import StudentOverview from "../../components/dashboard/student/StudentOverview.jsx";
import InternshipOpportunities from "../../components/dashboard/student/InternshipOpportunities.jsx";
import MyApplications from "../../components/dashboard/student/MyApplications.jsx";
import WeeklyReports from "../../components/dashboard/student/WeeklyReports.jsx";
import LetterRequests from "../../components/dashboard/student/LetterRequests.jsx";
import StipendApplication from "../../components/dashboard/student/StipendApplication.jsx";
import StudentProfile from "./StudentProfile.jsx";
import FeedbackAndEvaluation from "../../components/dashboard/student/FeedbackAndEvaluation.jsx";
import InternshipProcess from "../../components/dashboard/student/InternshipProcess.jsx";
import InternshipStatus from "../../components/dashboard/student/InternshipStatus.jsx";

const PlaceholderScreen = ({ title, description }) => (
  <div className="p-20 text-center animate-fade-in bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
      {title}
    </h3>
    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto font-medium">
      {description}
    </p>
    <button className="mt-8 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
      Return to Overview
    </button>
  </div>
);

const StudentDashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  const activeTab = location.pathname.split("/").pop() || "overview";

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <StudentSidebar activeTab={activeTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentNavbar />
        <main className="flex-1 overflow-y-auto p-6 pt-20">
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<StudentOverview studentData={user} />} />
            <Route path="opportunities" element={<InternshipOpportunities />} />
            <Route path="my-applications" element={<MyApplications />} />
            <Route path="reports" element={<WeeklyReports />} />
            <Route path="requests" element={<LetterRequests />} />
            <Route path="stipend" element={<StipendApplication />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="feedback" element={<FeedbackAndEvaluation />} />
            <Route path="process" element={<InternshipProcess />} />
            <Route path="status" element={<InternshipStatus />} />
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
