import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import UilSidebar from '../../components/dashboard/uil/UilSidebar.jsx';
import UilNavbar from '../../components/dashboard/uil/UilNavbar.jsx';
import DashboardSidebarOverlay from '../../components/dashboard/common/DashboardSidebarOverlay.jsx';
import UilOverview from '../../components/dashboard/uil/UilOverview.jsx';
import OrgApprovals from '../../components/dashboard/uil/OrgApprovals.jsx';
import InternshipApprovals from '../../components/dashboard/uil/InternshipApprovals.jsx';
import FulfillmentReports from '../../components/dashboard/uil/FulfillmentReports.jsx';
import UilRecommendationLetter from '../../components/dashboard/uil/UilRecommendationLetter.jsx';
import CompanyInvitation from '../../components/dashboard/uil/CompanyInvitation.jsx';
import DashboardChangePassword from '../../components/dashboard/common/DashboardChangePassword.jsx';

const PlaceholderScreen = ({ title, description }) => (
  <div className="p-6 sm:p-12 lg:p-20 text-center animate-fade-in bg-white rounded-3xl border border-slate-100 shadow-sm">
    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
      <FontAwesomeIcon icon={faInfoCircle} className="h-10 w-10" />
    </div>
    <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
    <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium text-sm leading-relaxed">{description}</p>
    <button className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20">
      Back to Dashboard Overview
    </button>
  </div>
);

const UilDashboard = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const activeTab = location.pathname.split('/').pop() || 'dashboard';

  const tabTitles = {
    'dashboard': 'Dashboard Overview',
    'company-invitation': 'Invite New Company',
    'approvals': 'Organization Approvals',
    'internship-approvals': 'Internship Management',
    'reports': 'Fulfillment Reports',
    'recommendation': 'Recommendation Letter',
    'change-password': 'Change Password',
    'notifications': 'Communications Hub',
    'settings': 'Administrative Settings'
  };

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex font-['Inter']">
      <DashboardSidebarOverlay isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <UilSidebar activeTab={activeTab} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-grow flex flex-col min-w-0">
        <UilNavbar title={tabTitles[activeTab] || 'UIL Portal'} onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-grow px-4 sm:px-6 lg:pl-[288px] lg:pr-8 pt-24 sm:pt-28 pb-12 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<UilOverview />} />
              <Route path="company-invitation" element={<CompanyInvitation />} />
              <Route path="approvals" element={<OrgApprovals />} />
              <Route path="internship-approvals" element={<InternshipApprovals />} />
              <Route path="monitoring" element={<Navigate to="../internship-approvals" replace />} />
              <Route path="reports" element={<FulfillmentReports />} />
              <Route path="recommendation" element={<UilRecommendationLetter />} />
              <Route path="change-password" element={<DashboardChangePassword />} />
              <Route 
                path="notifications" 
                element={<PlaceholderScreen title="Communications Center" description="Send broadcast announcements to industrial partners or focused messages to university faculty deans." />} 
              />
              <Route 
                path="settings" 
                element={<PlaceholderScreen title="Admin Configuration" description="Update portal security parameters, manage your UIL profile, and view global institution audit logs." />} 
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UilDashboard;
