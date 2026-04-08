import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import OrgSupervisorNavbar from "../../components/dashboard/org_supervisor/OrgSupervisorNavbar.jsx";
import OrgSupervisorSidebar from "../../components/dashboard/org_supervisor/OrgSupervisorSidebar.jsx";
import OrgSupervisorOverview from "../../components/dashboard/org_supervisor/OrgSupervisorOverview.jsx";
import Attendance from "../../components/dashboard/org_supervisor/Attendance.jsx";
import Evaluation from "../../components/dashboard/org_supervisor/Evaluation.jsx";
import SupervisorStudentEvaluation from "../../components/dashboard/org_supervisor/SupervisorStudentEvaluation.jsx";
import MyStudents from "../../components/dashboard/org_supervisor/MyStudents.jsx";
import SupervisorFeedback from "../../components/dashboard/org_supervisor/SupervisorFeedback.jsx";

const OrganizationSupervisorDashboard = () => {
  const location = useLocation();
  const activeTab = location.pathname.split("/").pop() || "overview";

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex font-['Inter']">
      <OrgSupervisorSidebar activeTab={activeTab} />
      <div className="flex-grow flex flex-col min-w-0">
        <OrgSupervisorNavbar />
        <main className="flex-grow pl-[288px] pr-8 pt-28 pb-12 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<OrgSupervisorOverview />} />
              <Route path="students" element={<MyStudents />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="evaluation" element={<Evaluation />} />
              <Route path="feedback" element={<SupervisorFeedback />} />
              <Route path="evaluate/:studentId" element={<SupervisorStudentEvaluation />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrganizationSupervisorDashboard;
