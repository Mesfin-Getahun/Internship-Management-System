
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import FacultySidebar from '../components/dashboard/faculty/FacultySidebar.jsx';
import FacultyNavbar from '../components/dashboard/faculty/FacultyNavbar.jsx';
import FacultyOverview from '../components/dashboard/faculty/FacultyOverview.jsx';
import FacultyManageStudents from '../components/dashboard/faculty/FacultyManageStudents.jsx';
import FacultyAssignMentors from '../components/dashboard/faculty/FacultyAssignMentors.jsx';

const PlaceholderScreen = ({ title, description }) => (
  <div className="p-20 text-center animate-fade-in bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto font-medium">{description}</p>
    <button className="mt-8 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
      Return to Overview
    </button>
  </div>
);

const FacultyDashboard = () => {
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() || 'overview';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <FacultyNavbar />
      <FacultySidebar activeTab={activeTab} />

      <main className="flex-grow pl-72 pr-8 pt-28 pb-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<FacultyOverview />} />
            <Route path="manage-students" element={<FacultyManageStudents />} />
            <Route path="assign-mentors" element={<FacultyAssignMentors />} />
            <Route 
              path="monitor-applications" 
              element={<PlaceholderScreen title="Application Monitoring" description="Track all student applications across partner organizations in real-time." />} 
            />
            <Route 
              path="approve-placements" 
              element={<PlaceholderScreen title="Placement Approval" description="Review and authorize final internship placements after organization selection." />} 
            />
            <Route 
              path="monitor-progress" 
              element={<PlaceholderScreen title="Internship Progress" description="Observe weekly report submission consistency and student engagement levels." />} 
            />
            <Route 
              path="org-evaluations" 
              element={<PlaceholderScreen title="Organization Evaluations" description="Access official performance reports submitted by organizational supervisors." />} 
            />
            <Route 
              path="reports" 
              element={<PlaceholderScreen title="Reports & Statistics" description="Generate comprehensive internship participation and performance analytics." />} 
            />
            <Route 
              path="profile" 
              element={<PlaceholderScreen title="Faculty Profile" description="Manage faculty institutional details and administrative portal security." />} 
            />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default FacultyDashboard;
