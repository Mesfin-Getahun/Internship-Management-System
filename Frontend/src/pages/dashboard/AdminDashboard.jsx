import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AdminNavbar from "../../components/dashboard/admin/AdminNavbar.jsx";
import AdminSidebar from "../../components/dashboard/admin/AdminSidebar.jsx";
import DashboardSidebarOverlay from "../../components/dashboard/common/DashboardSidebarOverlay.jsx";
import AdminOverview from "../../components/dashboard/admin/AdminOverview.jsx";
import AuditLogs from "../../components/dashboard/admin/AuditLogs.jsx";
import PlatformMonitoring from "../../components/dashboard/admin/PlatformMonitoring.jsx";
import DataBackup from "../../components/dashboard/admin/DataBackup.jsx";
import UserPasswordResets from "../../components/dashboard/admin/UserPasswordResets.jsx";
import DashboardChangePassword from "../../components/dashboard/common/DashboardChangePassword.jsx";

const AdminDashboard = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const activeTab = location.pathname.split("/").pop() || "overview";
  const titleMap = {
    overview: "Admin Overview",
    logs: "Audit Logs",
    monitoring: "Platform Monitoring",
    "user-passwords": "User Password Resets",
    "change-password": "Change Password",
    "data-backup": "Data & Backup",
  };

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <DashboardSidebarOverlay isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <AdminSidebar activeTab={activeTab} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AdminNavbar title={titleMap[activeTab] || "Admin Overview"} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6 pt-24">
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="logs" element={<AuditLogs />} />
            <Route path="monitoring" element={<PlatformMonitoring />} />
            <Route path="user-passwords" element={<UserPasswordResets />} />
            <Route path="change-password" element={<DashboardChangePassword />} />
            <Route path="data-backup" element={<DataBackup />} />
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
