import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import StudentNavbar from "../../components/dashboard/student/StudentNavbar.jsx";
import StudentSidebar from "../../components/dashboard/student/StudentSidebar.jsx";
import DashboardSidebarOverlay from "../../components/dashboard/common/DashboardSidebarOverlay.jsx";
import StudentOverview from "../../components/dashboard/student/StudentOverview.jsx";
import InternshipOpportunities from "../../components/dashboard/student/InternshipOpportunities.jsx";
import MyApplications from "../../components/dashboard/student/MyApplications.jsx";
import InternshipReport from "../../components/dashboard/student/WeeklyReports.jsx";
import StipendApplication from "../../components/dashboard/student/StipendApplication.jsx";
import StudentProfile from "./StudentProfile.jsx";
import FeedbackAndEvaluation from "../../components/dashboard/student/FeedbackAndEvaluation.jsx";
import InternshipStatus from "../../components/dashboard/student/InternshipStatus.jsx";
import ApplicationPage from "../../components/dashboard/student/ApplicationPage.jsx";
import StudentRecommendationLetter from "../../components/dashboard/student/StudentRecommendationLetter.jsx";
import DashboardChangePassword from "../../components/dashboard/common/DashboardChangePassword.jsx";

const PlaceholderScreen = ({ title, description }) => (
  <div className="p-6 sm:p-12 lg:p-20 text-center animate-fade-in bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
      <FontAwesomeIcon icon={faInfoCircle} className="h-10 w-10" />
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const activeTab = location.pathname.split("/").pop() || "overview";

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <DashboardSidebarOverlay isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <StudentSidebar activeTab={activeTab} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 lg:ml-64">
        <StudentNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 pt-24">
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route
              path="overview"
              element={<StudentOverview studentData={user} />}
            />
            <Route path="opportunities" element={<InternshipOpportunities />} />
            <Route path="my-applications" element={<MyApplications />} />
            <Route path="reports" element={<InternshipReport />} />
            <Route path="stipend" element={<StipendApplication />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="feedback" element={<FeedbackAndEvaluation />} />
            <Route path="status" element={<InternshipStatus />} />
            <Route
              path="recommendation"
              element={<StudentRecommendationLetter />}
            />
            <Route path="change-password" element={<DashboardChangePassword />} />
            <Route path="apply/:id" element={<ApplicationPage />} />
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
