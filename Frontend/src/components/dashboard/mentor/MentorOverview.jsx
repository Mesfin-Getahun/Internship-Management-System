
import React from 'react';

const MentorOverview = () => {
  const stats = [
    { label: 'Assigned Students', val: '10', sub: 'Max Capacity', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197', color: 'teal' },
    { label: 'Active Internships', val: '8', sub: 'Ongoing', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745V6a2 2 0 012-2h14a2 2 0 012 2v7.255z', color: 'blue' },
    { label: 'Awaiting Evaluation', val: '2', sub: 'Action Required', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'amber' },
    { label: 'Pending Reports', val: '4', sub: 'Week 12', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'red' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome, Dr. Samuel Ketema</h2>
        <p className="text-slate-500 text-sm mt-1 font-medium">Overview of your assigned interns and their academic supervision status.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
              </svg>
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
            <h3 className="font-bold text-slate-800 dark:text-white">Recent Student Activity</h3>
            <button className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 hover:underline">View All Activities</button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {[
              { type: 'report', text: 'Abebe Bikila submitted Weekly Report #12', time: '1 hour ago', color: 'teal' },
              { type: 'assignment', text: 'New student Eden Kebede assigned to you by Faculty', time: '5 hours ago', color: 'blue' },
              { type: 'approval', text: 'Saba Tadesse internship confirmed at Safaricom', time: 'Yesterday', color: 'emerald' },
              { type: 'evaluation', text: 'Evaluation period started for Mulugeta Seraw', time: '2 days ago', color: 'amber' }
            ].map((activity, i) => (
              <div key={i} className="p-5 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className={`w-10 h-10 rounded-xl bg-${activity.color}-50 dark:bg-${activity.color}-900/20 text-${activity.color}-600 dark:text-${activity.color}-400 flex items-center justify-center shrink-0`}>
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-snug">{activity.text}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-teal-900 text-white rounded-3xl p-8 relative overflow-hidden group shadow-xl shadow-teal-900/20">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-2">Mentor Actions</h4>
              <p className="text-teal-400 text-xs mb-6 font-medium">Direct access to supervision tools.</p>
              <div className="space-y-3">
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all text-left px-4 flex justify-between items-center">
                  Review Reports
                  <span>→</span>
                </button>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all text-left px-4 flex justify-between items-center">
                  Message Faculty
                  <span>→</span>
                </button>
                <button className="w-full py-3 bg-teal-500 hover:bg-teal-400 rounded-xl text-sm font-bold transition-all text-center shadow-lg shadow-black/20">
                  Submit Academic Grade
                </button>
              </div>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-colors"></div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4">Report Compliance</h4>
            <div className="flex items-end justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Weekly Submissions</span>
              <span className="text-xs font-black text-teal-600">92%</span>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: '92%' }}></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 italic">Maintain high compliance to ensure students stay on track for academic credit.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorOverview;
