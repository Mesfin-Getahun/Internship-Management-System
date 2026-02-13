
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import OrgSidebar from '../../components/dashboard/org/OrgSidebar.jsx';
import OrgNavbar from '../../components/dashboard/org/OrgNavbar.jsx';
import OrgOverview from '../../components/dashboard/org/OrgOverview.jsx';
import OrgVacancies from '../../components/dashboard/org/OrgVacancies.jsx';
import OrgPostInternship from '../../components/dashboard/org/OrgPostInternship.jsx';
import OrgApplications from '../../components/dashboard/org/OrgApplications.jsx';
import OrgSupervision from '../../components/dashboard/org/OrgSupervision.jsx';
import OrgEvaluation from '../../components/dashboard/org/OrgEvaluation.jsx';
import OrgProfile from '../../components/dashboard/org/OrgProfile.jsx';

const OrganizationDashboard = () => {
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() || 'overview';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <OrgNavbar />
      <OrgSidebar activeTab={activeTab} />

      <main className="flex-grow pl-72 pr-8 pt-28 pb-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<OrgOverview />} />
            <Route path="post-internship" element={<OrgPostInternship />} />
            <Route path="manage-posts" element={<OrgVacancies />} />
            <Route path="applications" element={<OrgApplications />} />
            <Route 
              path="approve-students" 
              element={
                <div className="p-20 text-center animate-fade-in bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Student Selection</h3>
                  <p className="text-slate-500 mt-2 max-w-sm mx-auto">Shortlist, interview, and approve students for assigned roles. Your selection will be sent to faculty for academic confirmation.</p>
                </div>
              } 
            />
            <Route path="supervision" element={<OrgSupervision />} />
            <Route path="evaluation" element={<OrgEvaluation />} />
            <Route path="profile" element={<OrgProfile />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default OrganizationDashboard;
