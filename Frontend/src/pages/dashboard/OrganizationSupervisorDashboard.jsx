import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import OrgSupervisorNavbar from "../../components/dashboard/org_supervisor/OrgSupervisorNavbar.jsx";
import OrgSupervisorSidebar from "../../components/dashboard/org_supervisor/OrgSupervisorSidebar.jsx";
import OrgSupervisorOverview from "../../components/dashboard/org_supervisor/OrgSupervisorOverview.jsx";

const OrganizationSupervisorDashboard = () => {
  const location = useLocation();
  const activeTab = location.pathname.split("/").pop() || "overview";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <OrgSupervisorSidebar activeTab={activeTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OrgSupervisorNavbar />
        <main className="flex-1 p-6 pt-20">
          <Routes>
            <Route index element={<OrgSupervisorOverview />} />
            {/* Add other routes here */}
            <Route path="*" element={<Navigate to="" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default OrganizationSupervisorDashboard;
