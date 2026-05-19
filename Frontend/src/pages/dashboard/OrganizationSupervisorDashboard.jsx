import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import OrgSupervisorNavbar from "../../components/dashboard/org_supervisor/OrgSupervisorNavbar.jsx";
import OrgSupervisorSidebar from "../../components/dashboard/org_supervisor/OrgSupervisorSidebar.jsx";
import DashboardSidebarOverlay from "../../components/dashboard/common/DashboardSidebarOverlay.jsx";
import OrgSupervisorOverview from "../../components/dashboard/org_supervisor/OrgSupervisorOverview.jsx";
import Attendance from "../../components/dashboard/org_supervisor/Attendance.jsx";
import Evaluation from "../../components/dashboard/org_supervisor/Evaluation.jsx";
import SupervisorStudentEvaluation from "../../components/dashboard/org_supervisor/SupervisorStudentEvaluation.jsx";
import MyStudents from "../../components/dashboard/org_supervisor/MyStudents.jsx";
import SupervisorFeedback from "../../components/dashboard/org_supervisor/SupervisorFeedback.jsx";
import SupervisorChangePassword from "../../components/dashboard/org_supervisor/SupervisorChangePassword.jsx";

const OrganizationSupervisorDashboard = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const activeTab = location.pathname.split("/").pop() || "overview";

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex font-['Inter']">
      <DashboardSidebarOverlay isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <OrgSupervisorSidebar activeTab={activeTab} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-grow flex flex-col min-w-0">
        <OrgSupervisorNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-grow px-4 sm:px-6 lg:pl-[312px] lg:pr-8 pt-24 sm:pt-28 pb-12 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<OrgSupervisorOverview />} />
              <Route path="students" element={<MyStudents />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="evaluation" element={<Evaluation />} />
              <Route path="feedback" element={<SupervisorFeedback />} />
              <Route path="change-password" element={<SupervisorChangePassword />} />
              <Route path="evaluate/:studentId" element={<SupervisorStudentEvaluation />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrganizationSupervisorDashboard;
