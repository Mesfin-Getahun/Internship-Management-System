import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import UilSidebar from '../../components/dashboard/uil/UilSidebar.jsx';
import UilNavbar from '../../components/dashboard/uil/UilNavbar.jsx';
import UilOverview from '../../components/dashboard/uil/UilOverview.jsx';
import OrgApprovals from '../../components/dashboard/uil/OrgApprovals.jsx';
import InternshipMonitoring from '../../components/dashboard/uil/InternshipMonitoring.jsx';
import InternshipApprovals from '../../components/dashboard/uil/InternshipApprovals.jsx';
import FulfillmentReports from '../../components/dashboard/uil/FulfillmentReports.jsx';
import UilRecommendationLetter from '../../components/dashboard/uil/UilRecommendationLetter.jsx';
import CompanyInvitation from '../../components/dashboard/uil/CompanyInvitation.jsx';

const PlaceholderScreen = ({ title, description }) => (
  <div className="p-20 text-center animate-fade-in bg-white rounded-3xl border border-slate-100 shadow-sm">
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
  const activeTab = location.pathname.split('/').pop() || 'dashboard';

  const tabTitles = {
    'dashboard': 'Dashboard Overview',
    'company-invitation': 'Invite New Company',
    'approvals': 'Organization Approvals',
    'internship-approvals': 'Internship Approvals',
    'monitoring': 'Internship Monitoring',
    'reports': 'Fulfillment Reports',
    'recommendation': 'Recommendation Letter',
    'notifications': 'Communications Hub',
    'settings': 'Administrative Settings'
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] flex font-['Inter']">
      <UilSidebar activeTab={activeTab} />
      
      <div className="flex-grow flex flex-col min-w-0">
        <UilNavbar title={tabTitles[activeTab] || 'UIL Portal'} />
        
        <main className="flex-grow pl-[288px] pr-8 pt-28 pb-12 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<UilOverview />} />
              <Route path="company-invitation" element={<CompanyInvitation />} />
              <Route path="approvals" element={<OrgApprovals />} />
              <Route path="internship-approvals" element={<InternshipApprovals />} />
              <Route path="monitoring" element={<InternshipMonitoring />} />
              <Route path="reports" element={<FulfillmentReports />} />
              <Route path="recommendation" element={<UilRecommendationLetter />} />
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
