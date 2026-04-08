import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faHourglassHalf, faBriefcase, faCheckCircle, faGraduationCap, faSpinner } from '@fortawesome/free-solid-svg-icons';

const UilOverview = () => {
  const [stats, setStats] = useState({
     totalOrganizations: 0,
     pendingOrganizations: 0,
     totalInternships: 0,
     pendingInternships: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const [activeOrgs, pendingOrgs, allInterns, pendingInterns] = await Promise.all([
           axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/UIL/companies/active`, { headers: { Authorization: `Bearer ${user?.token}` } }),
           axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/UIL/companyRequest`, { headers: { Authorization: `Bearer ${user?.token}` } }),
           axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/UIL/internships`, { headers: { Authorization: `Bearer ${user?.token}` } }),
           axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/UIL/internships/pending`, { headers: { Authorization: `Bearer ${user?.token}` } })
        ]);

        setStats({
          totalOrganizations: activeOrgs.data.count || 0,
          pendingOrganizations: pendingOrgs.data.count || 0,
          totalInternships: allInterns.data.count || 0,
          pendingInternships: pendingInterns.data.internships?.length || 0
        });

      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchDashboardStats();
  }, [user]);

  const displayStats = [
    { label: 'Total Organizations', val: stats.totalOrganizations, icon: faBuilding, trend: 'Active', color: 'indigo', path: '/uil/approvals' },
    { label: 'Pending Orgs', val: stats.pendingOrganizations, icon: faHourglassHalf, trend: 'Requests', color: 'amber', path: '/uil/approvals' },
    { label: 'Total Internships', val: stats.totalInternships, icon: faBriefcase, trend: 'All Time', color: 'blue', path: '/uil/monitoring' },
    { label: 'Pending Internships', val: stats.pendingInternships, icon: faCheckCircle, trend: 'Action Req', color: 'red', path: '/uil/internship-approvals' },
    { label: 'Completed Placements', val: 'N/A', icon: faGraduationCap, trend: 'Semesterly', color: 'emerald', path: '/uil/reports' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Oversight</h2>
          <p className="text-slate-500 font-medium mt-1">Institutional monitoring of university-industry linkages.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-100 transition-all border border-indigo-200/50">Export Global Stats</button>
        </div>
      </header>

      {loading ? (
          <div className="flex justify-center items-center h-32 w-full text-indigo-400">
             <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {displayStats.map((stat, i) => (
            <button
              key={i}
              type="button"
              onClick={() => navigate(stat.path)}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-left"
            >
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <FontAwesomeIcon icon={stat.icon} className="h-6 w-6" />
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">{stat.label}</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-slate-800">{stat.val}</span>
                <span className={`text-[10px] font-bold text-${stat.color}-600 px-2 py-0.5 bg-${stat.color}-50 rounded-lg`}>{stat.trend}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simplified Visualization Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 h-96 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-800">Placement Distribution by Faculty</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div><span className="text-[10px] font-black uppercase text-slate-400">Target</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-200"></div><span className="text-[10px] font-black uppercase text-slate-400">Actual</span></div>
            </div>
          </div>
          <div className="flex-grow flex items-end gap-6 px-4 cursor-not-allowed opacity-75">
             {[
               { f: 'Computing', val: 90 }, { f: 'Civil', val: 75 }, { f: 'Mech', val: 60 }, { f: 'Elect', val: 85 }, { f: 'Chem', val: 45 }, { f: 'Others', val: 55 }
             ].map((item, idx) => (
               <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                 <div className="w-full bg-slate-50 rounded-xl relative h-full flex flex-col justify-end overflow-hidden border border-slate-100">
                    <div className="w-full bg-indigo-500 transition-all duration-1000 group-hover:bg-indigo-600" style={{ height: `${item.val}%` }}></div>
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter text-center h-4">{item.f}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h3 className="font-bold text-slate-800 mb-6">System Health</h3>
            <div className="space-y-6">
              {[
                { label: 'DB Connectivity', status: 'Operational', color: 'green' },
                { label: 'Portal Traffic', status: 'Moderate', color: 'indigo' },
                { label: 'Notification Service', status: 'Operational', color: 'green' }
              ].map((sys, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">{sys.label}</span>
                  <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase text-${sys.color}-600`}>
                    <span className={`w-2 h-2 rounded-full bg-${sys.color}-500 animate-pulse`}></span>
                    {sys.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-2">UIL Report Engine</h4>
              <p className="text-indigo-300 text-xs leading-relaxed mb-6">Generate semester-end fulfillment analytics for the university board.</p>
              <button className="w-full py-3 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl shadow-black/20">
                Run Analytics
              </button>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UilOverview;
