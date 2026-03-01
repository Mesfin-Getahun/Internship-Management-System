import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import FacultySidebar from '../../components/dashboard/faculty/FacultySidebar.jsx';
import FacultyNavbar from '../../components/dashboard/faculty/FacultyNavbar.jsx';
import FacultyOverview from '../../components/dashboard/faculty/FacultyOverview.jsx';
import FacultyManageStudents from '../../components/dashboard/faculty/FacultyManageStudents';
import FacultyAssignMentors from '../../components/dashboard/faculty/FacultyAssignMentors';
import FacultyReports from '../../components/dashboard/faculty/FacultyReports';
import FacultyOrgEvaluations from '../../components/dashboard/faculty/FacultyOrgEvaluations';
import FacultyMonitorProgress from '../../components/dashboard/faculty/FacultyMonitorProgress';
import FacultyStipendManagement from '../../components/dashboard/faculty/FacultyStipendManagement';
import FacultyProfile from '../../components/dashboard/faculty/FacultyProfile';

const FacultyDashboard = () => {
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() || 'overview';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <FacultySidebar activeTab={activeTab} />

      <div className="flex-1 flex flex-col ml-64">
        <FacultyNavbar />
        <main className="flex-grow p-6 pt-20">
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
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;
