import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import OrgNavbar from '../../components/dashboard/org/OrgNavbarLive.jsx';
import OrgSidebar from '../../components/dashboard/org/OrgSidebar.jsx';
import OrgOverview from '../../components/dashboard/org/OrgOverviewLive.jsx';
import OrgVacancies from '../../components/dashboard/org/OrgVacancies.jsx';

import OrgApplications from '../../components/dashboard/org/OrgApplications.jsx';
import OrgProfile from '../../components/dashboard/org/OrgProfileLive.jsx';
import OrgPostInternship from '../../components/dashboard/org/OrgPostInternship.jsx';


import AssignedStudents from '../../components/dashboard/org/AssignedStudentsLive.jsx';

const OrganizationDashboard = () => {
  const location = useLocation();
  const activeTab = location.pathname.split("/").pop() || "overview";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <OrgSidebar />
      <div className="ml-64 flex flex-col">
        <OrgNavbar />
        <main className="flex-1 p-6 pt-20">
          <Routes>
            <Route index element={<OrgOverview />} />
            <Route path="overview" element={<OrgOverview />} />
            <Route path="vacancies" element={<OrgVacancies />} />
            
            <Route path="applications" element={<OrgApplications />} />
            <Route path="post-internship" element={<OrgPostInternship />} />
            <Route path="assigned-students" element={<AssignedStudents />} />
            <Route path="profile" element={<OrgProfile />} />
          
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
