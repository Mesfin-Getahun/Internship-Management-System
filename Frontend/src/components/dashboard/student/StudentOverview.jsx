import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faThumbsUp, faUserTie, faBriefcase, faInfoCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import InternshipDetails from './InternshipDetails';

export const getInternshipLabel = (appState = 'NOT_STARTED') => {
  const labels = {
    NOT_STARTED: 'Not Started',
    PENDING: 'Pending Approval',
    ACTIVATED: 'Active',
    REJECTED: 'Rejected',
    COMPLETED: 'Completed',
  };
  return labels[appState] || 'Unknown Status';
};

const PlacedStudentView = ({ internship }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 space-y-8">
      <InternshipDetails internship={internship} />
    </div>
    <div className="space-y-6">
    </div>
  </div>
);

const UnplacedStudentView = ({ stats, isPlaced, applications }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
          <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
            <FontAwesomeIcon icon={stat.icon} className="h-6 w-6" />
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-slate-800 dark:text-white">{stat.val}</span>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-white">Recent Activity</h3>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-800/50 max-h-80 overflow-y-auto">
          {applications && applications.length > 0 ? applications.map((activity, i) => (
            <div key={i} className="p-5 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className={`w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-snug">
                  Applied to {activity.title || 'Role'} at {activity.company_name || 'Organization'}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
                  Status: {activity.status || 'Pending'}
                </p>
              </div>
            </div>
          )) : (
             <div className="p-8 text-center text-slate-500 text-sm">No recent activity found.</div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-600 text-white rounded-3xl p-8 relative overflow-hidden group shadow-xl shadow-blue-600/20">
          <div className="relative z-10">
            <h4 className="text-xl font-bold mb-2">Quick Actions</h4>
            <p className="text-blue-100 text-xs mb-6 font-medium">Common student tasks.</p>
            <div className="space-y-3">
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all text-left px-4 flex justify-between items-center group/btn">
                Browse Opportunities
                <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity">→</span>
              </button>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all text-left px-4 flex justify-between items-center group/btn">
                Submit Weekly Report
                <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity">→</span>
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <h4 className="font-bold text-slate-800 dark:text-white mb-4">Placement Status</h4>
          {!isPlaced ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                 <FontAwesomeIcon icon={faInfoCircle} className="h-6 w-6" />
              </div>
              <p className="text-xs text-slate-500 font-bold mb-4">You have not been placed yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">✓</div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Placed</p>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '40%' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
);

const StudentOverview = ({ studentData = {} }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [activeInternship, setActiveInternship] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/myInternship`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        const data = res.data.applications || res.data.internships || res.data.data || [];
        setActiveInternship(res.data.internship || null);
        if (Array.isArray(data)) {
           setApplications(data);
        } else if (data) {
           setApplications([data]);
        }
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchMyApplications();
  }, [user]);

  const isPlaced = Boolean(activeInternship);
  const appState = isPlaced ? 'ACTIVATED' : 'NOT_STARTED';

  const stats = [
    { label: 'Applications Sent', val: applications.length.toString(), icon: faPaperPlane, color: 'sky' },
    { label: 'Positive Replies', val: applications.filter(a => ['accepted', 'in progress', 'active'].includes((a.status || '').toLowerCase())).length.toString(), icon: faThumbsUp, color: 'amber' },
    { label: 'Interviews', val: '0', icon: faUserTie, color: 'emerald' },
    { label: 'Internship Status', val: getInternshipLabel(appState), icon: faBriefcase, color: 'indigo' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-blue-500">
         <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white">Student Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Monitor your internship applications and performance tracking.</p>
      </header>

      {isPlaced ? <PlacedStudentView internship={activeInternship} /> : <UnplacedStudentView stats={stats} isPlaced={isPlaced} applications={applications} />}
    </div>
  );
};

export default StudentOverview;
