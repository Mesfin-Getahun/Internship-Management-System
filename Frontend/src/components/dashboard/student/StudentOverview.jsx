
import React from 'react';

// Exported helper for tests: maps appState to a readable internship status label.
export const getInternshipLabel = (appState = 'NOT_STARTED') => {
  switch (appState) {
    case 'PENDING_UIL':
      return 'Pending UIL Approval';
    case 'ACTIVATED':
      return 'Active';
    case 'COMPLETED':
      return 'Completed';
    default:
      return 'Not Started';
  }
};

const StudentOverview = ({ appState = 'NOT_STARTED', isPlaced = false }) => {
  const placed = isPlaced || appState === 'ACTIVATED' || appState === 'COMPLETED';
  const stats = [
    { label: 'Active Internship', val: placed ? 'Yes' : 'No', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745V6a2 2 0 012-2h14a2 2 0 012 2v7.255z', color: placed ? 'emerald' : 'slate' },
    { label: 'Applications Sent', val: '8', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', color: 'blue' },
    { label: 'Application Status', val: '2 Accepted', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'amber' },
    { label: 'Internship Status', val: getInternshipLabel(appState), icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745V6a2 2 0 012-2h14a2 2 0 012 2v7.255z', color: 'indigo' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome, Abebe Bikila</h2>
        <p className="text-slate-500 text-sm mt-1 font-medium">Monitor your internship applications and performance tracking.</p>
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
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white">Recent Activity</h3>
            <button className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 hover:underline">View History</button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {[
              { text: 'Applied to Software Intern role at Safaricom Ethiopia', time: '3 hours ago', type: 'application', color: 'blue' },
              { text: 'Weekly Report #10 approved by Mentor', time: 'Yesterday', type: 'report', color: 'emerald' },
              { text: 'Application rejected by ABC Tech Solutions', time: '2 days ago', type: 'reject', color: 'red' },
              { text: 'Internship interview scheduled with CBE', time: '3 days ago', type: 'interview', color: 'amber' }
            ].map((activity, i) => (
              <div key={i} className="p-5 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className={`w-10 h-10 rounded-xl bg-${activity.color}-50 dark:bg-${activity.color}-900/20 text-${activity.color}-600 dark:text-${activity.color}-400 flex items-center justify-center shrink-0`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
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
                <button className="w-full py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl text-sm font-bold transition-all text-center shadow-lg">
                  View Mentor Feedback
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
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-500 font-bold mb-4">You have not been placed yet.</p>
                <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">Complete Profile</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">✓</div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Placed at Safaricom</p>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '40%' }}></div>
                </div>
                <p className="text-[10px] text-slate-400 italic">Internship completion: 40% (Week 6/15)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;
