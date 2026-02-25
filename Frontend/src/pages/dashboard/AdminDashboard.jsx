import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminNavbar from "../../components/dashboard/admin/AdminNavbar.jsx";
import AdminSidebar from "../../components/dashboard/admin/AdminSidebar.jsx";
import AdminOverview from "../../components/dashboard/admin/AdminOverview.jsx";
import ManageUsers from "../../components/dashboard/admin/ManageUsers.jsx";
import ManageFaculties from "../../components/dashboard/admin/ManageFaculties.jsx";
import RolesPermissions from "../../components/dashboard/admin/RolesPermissions.jsx";
import AuditLogs from "../../components/dashboard/admin/AuditLogs.jsx";
import PlatformMonitoring from "../../components/dashboard/admin/PlatformMonitoring.jsx";

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <AdminSidebar />

      {/* Main column: navbar on top, content below */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* If AdminNavbar is NOT fixed, just render it normally */}
        <AdminNavbar />

        {/* Main content should not sit under the navbar */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="faculties" element={<ManageFaculties />} />
            <Route path="roles" element={<RolesPermissions />} />
            <Route path="logs" element={<AuditLogs />} />
            <Route path="monitoring" element={<PlatformMonitoring />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
