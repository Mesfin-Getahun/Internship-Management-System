
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import StudentSidebar from '../../components/dashboard/student/StudentSidebar.jsx';
import StudentNavbar from '../../components/dashboard/student/StudentNavbar.jsx';
import StudentOverview from '../../components/dashboard/student/StudentOverview.jsx';
import InternshipOpportunities from '../../components/dashboard/student/InternshipOpportunities.jsx';
import MyApplications from '../../components/dashboard/student/MyApplications.jsx';
import WeeklyReports from '../../components/dashboard/student/WeeklyReports.jsx';

const PlaceholderScreen = ({ title, description }) => (
  <div className="p-20 text-center animate-fade-in bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto font-medium">{description}</p>
    <button className="mt-8 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
      Return to Overview
    </button>
  </div>
);

const StudentDashboard = () => {
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() || 'overview';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300 font-['Inter']">
      <StudentNavbar />
      <StudentSidebar activeTab={activeTab} />

      <main className="flex-grow pl-72 pr-8 pt-28 pb-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<StudentOverview isPlaced={true} />} />
            <Route path="opportunities" element={<InternshipOpportunities />} />
            <Route path="my-applications" element={<MyApplications />} />
            <Route 
              path="my-internship" 
              element={<PlaceholderScreen title="My Internship" description="View details of your active placement, assigned mentor, and institutional timeline." />} 
            />
            <Route path="weekly-reports" element={<WeeklyReports />} />
            <Route 
              path="feedback" 
              element={<PlaceholderScreen title="Mentor Feedback" description="Review qualitative and quantitative feedback from your academic mentor regarding your technical growth." />} 
            />
            <Route 
              path="profile" 
              element={<PlaceholderScreen title="Student Profile" description="Manage your academic portfolio, technical skills, and portal security settings." />} 
            />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
