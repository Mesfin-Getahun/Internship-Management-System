import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots } from '@fortawesome/free-solid-svg-icons';
import MentorSidebar from '../../components/dashboard/mentor/MentorSidebar.jsx';
import MentorNavbar from '../../components/dashboard/mentor/MentorNavbar.jsx';
import DashboardSidebarOverlay from '../../components/dashboard/common/DashboardSidebarOverlay.jsx';
import MentorOverview from '../../components/dashboard/mentor/MentorOverview.jsx';
import MyStudents from '../../components/dashboard/mentor/MyStudents';
import ProgressTracker from '../../components/dashboard/mentor/ProgressTracker';
import MentorEvaluation from '../../components/dashboard/mentor/MentorEvaluation';
import StudentSubmissions from '../../components/dashboard/mentor/StudentSubmissions';
import MentorProfileLive from '../../components/dashboard/mentor/MentorProfileLive.jsx';
import DashboardChangePassword from '../../components/dashboard/common/DashboardChangePassword.jsx';

const PlaceholderScreen = ({ title, description }) => (
  <div className="p-6 sm:p-12 lg:p-20 text-center animate-fade-in bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
    <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
      <FontAwesomeIcon icon={faCommentDots} className="h-10 w-10" />
    </div>
    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto font-medium">{description}</p>
    <button className="mt-8 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95">
      Return to Overview
    </button>
  </div>
);

const MentorDashboard = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const activeTab = location.pathname.split('/').pop() || 'overview';

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-['Inter'] transition-colors duration-300">
      <DashboardSidebarOverlay isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <MentorSidebar activeTab={activeTab} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-grow flex flex-col min-w-0">
        <MentorNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-grow px-4 sm:px-6 pb-6 pt-24 lg:pl-80">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<MentorOverview />} />
              <Route path="my-students" element={<MyStudents />} />
              <Route path="progress-tracker" element={<ProgressTracker />} />
              <Route path="student-submissions" element={<StudentSubmissions />} />
              <Route path="organization-updates" element={<Navigate to="../feedback" replace />} />
              <Route path="feedback" element={<MentorEvaluation />} />
              <Route path="evaluation" element={<Navigate to="../feedback" replace />} />
              <Route 
                path="weekly-reports" 
                element={<StudentSubmissions />} 
              />
              <Route path="submit-evaluation" element={<Navigate to="../feedback" replace />} />
              <Route 
                path="communication" 
                element={<PlaceholderScreen title="Messaging Hub" description="Communicate directly with your assigned students and the Faculty of Computing administration." />} 
              />
              <Route path="profile" element={<MentorProfileLive />} />
              <Route path="change-password" element={<DashboardChangePassword />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MentorDashboard;
