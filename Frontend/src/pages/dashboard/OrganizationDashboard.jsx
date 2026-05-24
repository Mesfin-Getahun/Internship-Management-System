import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import OrgNavbar from '../../components/dashboard/org/OrgNavbarLive.jsx';
import OrgSidebar from '../../components/dashboard/org/OrgSidebar.jsx';
import DashboardSidebarOverlay from '../../components/dashboard/common/DashboardSidebarOverlay.jsx';
import OrgOverview from '../../components/dashboard/org/OrgOverviewLive.jsx';
import OrgVacancies from '../../components/dashboard/org/OrgVacancies.jsx';

import OrgApplications from '../../components/dashboard/org/OrgApplications.jsx';
import OrgProfile from '../../components/dashboard/org/OrgProfileLive.jsx';
import OrgPostInternship from '../../components/dashboard/org/OrgPostInternship.jsx';


import AssignedStudents from '../../components/dashboard/org/AssignedStudentsLive.jsx';
import CompanyMentors from '../../components/dashboard/org/CompanyMentors.jsx';
import DashboardChangePassword from '../../components/dashboard/common/DashboardChangePassword.jsx';

const OrganizationDashboard = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const activeTab = location.pathname.split("/").pop() || "overview";

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <DashboardSidebarOverlay isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <OrgSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-col min-w-0 lg:ml-64">
        <OrgNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6 pt-24">
          <Routes>
            <Route index element={<OrgOverview />} />
            <Route path="overview" element={<OrgOverview />} />
            <Route path="vacancies" element={<OrgVacancies />} />
            
            <Route path="applications" element={<OrgApplications />} />
            <Route path="post-internship" element={<OrgPostInternship />} />
            <Route path="company-mentors" element={<CompanyMentors />} />
            <Route path="assigned-students" element={<AssignedStudents />} />
            <Route path="profile" element={<OrgProfile />} />
            <Route path="change-password" element={<DashboardChangePassword />} />
          
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
