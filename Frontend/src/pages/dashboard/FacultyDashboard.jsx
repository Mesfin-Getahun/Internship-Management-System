import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import FacultySidebar from '../../components/dashboard/faculty/FacultySidebar.jsx';
import FacultyNavbar from '../../components/dashboard/faculty/FacultyNavbar.jsx';
import DashboardSidebarOverlay from '../../components/dashboard/common/DashboardSidebarOverlay.jsx';
import FacultyOverview from '../../components/dashboard/faculty/FacultyOverviewLive.jsx';
import FacultyManageStudents from '../../components/dashboard/faculty/FacultyManageStudentsLive.jsx';
import FacultyAssignMentors from '../../components/dashboard/faculty/FacultyAssignMentors';
import FacultyReports from '../../components/dashboard/faculty/FacultyReportsLive.jsx';
import FacultyOrgEvaluations from '../../components/dashboard/faculty/FacultyOrgEvaluations';
import FacultyMonitorProgress from '../../components/dashboard/faculty/FacultyMonitorProgress';
import FacultyStipendManagement from '../../components/dashboard/faculty/FacultyStipendManagementLive.jsx';
import FacultyProfile from '../../components/dashboard/faculty/FacultyProfileLive.jsx';
import DashboardChangePassword from '../../components/dashboard/common/DashboardChangePassword.jsx';

const FacultyDashboard = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const activeTab = location.pathname.split('/').pop() || 'overview';

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <DashboardSidebarOverlay isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <FacultySidebar activeTab={activeTab} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <FacultyNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-grow px-4 sm:px-6 pb-4 sm:pb-6 pt-24">
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<FacultyOverview />} />
            <Route path="manage-students" element={<FacultyManageStudents />} />
            <Route path="assign-mentors" element={<FacultyAssignMentors />} />
            <Route path="monitor-progress" element={<FacultyMonitorProgress />} />
            <Route path="org-evaluations" element={<FacultyOrgEvaluations />} />
            <Route path="reports" element={<FacultyReports />} />
            <Route path="stipend-management" element={<FacultyStipendManagement />} />
            <Route path="profile" element={<FacultyProfile />} />
            <Route path="change-password" element={<DashboardChangePassword />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;
