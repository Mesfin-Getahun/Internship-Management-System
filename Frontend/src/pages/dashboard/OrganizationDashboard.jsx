import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import OrgNavbar from "../../components/dashboard/org/OrgNavbar.jsx";
import OrgSidebar from "../../components/dashboard/org/OrgSidebar.jsx";
import OrgOverview from "../../components/dashboard/org/OrgOverview.jsx";
import OrgVacancies from "../../components/dashboard/org/OrgVacancies.jsx";
import OrgApplications from "../../components/dashboard/org/OrgApplications.jsx";
import OrgProfile from "../../components/dashboard/org/OrgProfile.jsx";
import OrgPostInternship from "../../components/dashboard/org/OrgPostInternship.jsx";

const OrganizationDashboard = () => {
  const location = useLocation();
  const activeTab = location.pathname.split("/").pop() || "overview";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <OrgSidebar activeTab={activeTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OrgNavbar />
        <main className="flex-1 p-6 pt-20">
          <Routes>
            <Route index element={<OrgOverview />} />
            <Route path="vacancies" element={<OrgVacancies />} />
            <Route path="applications" element={<OrgApplications />} />
            <Route path="post" element={<OrgPostInternship />} />
            <Route path="profile" element={<OrgProfile />} />
            <Route path="*" element={<Navigate to="" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
