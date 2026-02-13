
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MentorSidebar from '../../components/dashboard/mentor/MentorSidebar.jsx';
import MentorNavbar from '../../components/dashboard/mentor/MentorNavbar.jsx';
import MentorOverview from '../../components/dashboard/mentor/MentorOverview.jsx';
import MyStudents from '../../components/dashboard/mentor/MyStudents.jsx';
import ProgressTracker from '../../components/dashboard/mentor/ProgressTracker.jsx';
import MentorEvaluation from '../../components/dashboard/mentor/MentorEvaluation.jsx';

const PlaceholderScreen = ({ title, description }) => (
  <div className="p-20 text-center animate-fade-in bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
    <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
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
  const activeTab = location.pathname.split('/').pop() || 'overview';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <MentorNavbar />
      <MentorSidebar activeTab={activeTab} />

      <main className="flex-grow pl-72 pr-8 pt-28 pb-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<MentorOverview />} />
            <Route path="my-students" element={<MyStudents />} />
            <Route path="monitor-progress" element={<ProgressTracker />} />
            <Route 
              path="weekly-reports" 
              element={<PlaceholderScreen title="Weekly Reports Review" description="Verify student task logs and provide feedback on their weekly technical submissions." />} 
            />
            <Route path="submit-evaluation" element={<MentorEvaluation />} />
            <Route 
              path="communication" 
              element={<PlaceholderScreen title="Messaging Hub" description="Communicate directly with your assigned students and the Faculty of Computing administration." />} 
            />
            <Route 
              path="profile" 
              element={<PlaceholderScreen title="Mentor Profile" description="Manage your academic background, specialization areas, and portal security settings." />} 
            />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default MentorDashboard;
