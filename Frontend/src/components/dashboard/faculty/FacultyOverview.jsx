import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faGraduationCap, faBriefcase, faHourglassHalf, faPaperPlane, faCheckCircle, faFileAlt, faUserTie } from '@fortawesome/free-solid-svg-icons';

const FacultyOverview = () => {
  const stats = [
    { label: 'Registered Students', val: '452', sub: '+12 this week', icon: faUsers, color: 'blue' },
    { label: 'Eligible for Internship', val: '184', sub: '4th Year Students', icon: faGraduationCap, color: 'emerald' },
    { label: 'Active Placements', val: '128', sub: 'Assigned to Orgs', icon: faBriefcase, color: 'indigo' },
    { label: 'Pending Approvals', val: '15', sub: 'Action Required', icon: faHourglassHalf, color: 'amber' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Faculty Dashboard Overview</h2>
        <p className="text-slate-500 text-sm mt-1 font-medium">Monitoring internship progression for the Faculty of Computing.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <FontAwesomeIcon icon={stat.icon} className="h-6 w-6" />
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-800 dark:text-white">{stat.val}</span>
              <span className={`text-[10px] font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white">Recent Activity</h3>
            <button className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 hover:underline">View Historical Logs</button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {[
              { type: 'application', text: 'Abebe Bikila applied for Web Developer at Ethiopian Airlines', time: '12 mins ago', icon: faPaperPlane, color: 'blue' },
              { type: 'approval', text: 'Saba Tadesse selection confirmed by Commercial Bank of Ethiopia', time: '2 hours ago', icon: faCheckCircle, color: 'emerald' },
              { type: 'evaluation', text: 'Evaluation submitted by Safaricom Ethiopia for Eden Kebede', time: 'Yesterday', icon: faFileAlt, color: 'amber' },
              { type: 'mentor', text: 'New mentor Dr. Yilma assigned to 8 remaining students', time: '2 days ago', icon: faUserTie, color: 'indigo' }
            ].map((activity, i) => (
              <div key={i} className="p-5 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className={`w-10 h-10 rounded-xl bg-${activity.color}-50 dark:bg-${activity.color}-900/20 text-${activity.color}-600 dark:text-${activity.color}-400 flex items-center justify-center shrink-0`}>
                  <FontAwesomeIcon icon={activity.icon} className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-snug">{activity.text}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 dark:bg-emerald-900/20 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-2">Quick Actions</h4>
              <p className="text-slate-400 text-xs mb-6 font-medium">Administrative tasks for today.</p>
              <div className="space-y-3">
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all text-left px-4 flex justify-between items-center group/btn">
                  Assign Mentor
                  <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity">→</span>
                </button>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all text-left px-4 flex justify-between items-center group/btn">
                  Generate Semester Report
                  <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity">→</span>
                </button>
                <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold transition-all text-center">
                  Review Pending Approvals
                </button>
              </div>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors"></div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4">Mentor Student Ratio</h4>
            <div className="flex items-end justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Current Load (Avg)</span>
              <span className="text-xs font-black text-emerald-600">8.2 / 10</span>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: '82%' }}></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 italic">University policy limits each mentor to a maximum of 10 students for quality supervision.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyOverview;
