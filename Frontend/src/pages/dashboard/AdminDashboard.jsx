
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/dashboard/admin/AdminSidebar.jsx';
import AdminNavbar from '../../components/dashboard/admin/AdminNavbar.jsx';
import AdminOverview from '../../components/dashboard/admin/AdminOverview.jsx';
import ManageFaculties from '../../components/dashboard/admin/ManageFaculties.jsx';
import ManageUsers from '../../components/dashboard/admin/ManageUsers.jsx';
import RolesPermissions from '../../components/dashboard/admin/RolesPermissions.jsx';
import PlatformMonitoring from '../../components/dashboard/admin/PlatformMonitoring.jsx';
import AuditLogs from '../../components/dashboard/admin/AuditLogs.jsx';

const PlaceholderScreen = ({ title, description }) => (
  <div className="p-20 text-center animate-fade-in bg-white rounded-3xl border border-slate-100 shadow-sm">
    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
    <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium text-sm leading-relaxed">{description}</p>
    <button className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20">
      Re-evaluate Node Access
    </button>
  </div>
);

const AdminDashboard = () => {
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() || 'dashboard';

  const tabTitles = {
    'dashboard': 'Platform Insights',
    'faculties': 'Institutional Nodes',
    'users': 'Identity Management',
    'permissions': 'Authorization Matrix',
    'monitoring': 'Technical Health',
    'audit-logs': 'Forensic Logs',
    'settings': 'Global Configuration'
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex font-['Inter'] selection:bg-indigo-100">
      <AdminSidebar activeTab={activeTab} />
      
      <div className="flex-grow flex flex-col min-w-0">
        <AdminNavbar title={tabTitles[activeTab] || 'Admin Terminal'} />
        
        <main className="flex-grow pl-[288px] pr-8 pt-28 pb-12 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminOverview />} />
              <Route path="faculties" element={<ManageFaculties />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="permissions" element={<RolesPermissions />} />
              <Route path="monitoring" element={<PlatformMonitoring />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route 
                path="settings" 
                element={<PlaceholderScreen title="Core Configuration" description="Manage database snapshots, primary email smtp settings, and platform maintenance scheduling." />} 
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
