
import React from 'react';

const ProgressTracker = () => {
  const interns = [
    { name: 'Abebe Bikila', org: 'Ethiopian Airlines', role: 'Cloud Intern', progress: 75, status: 'On Track', reports: '12/15' },
    { name: 'Saba Tadesse', org: 'Safaricom Ethiopia', role: 'Security Intern', progress: 40, status: 'On Track', reports: '6/15' },
    { name: 'Mulugeta Seraw', org: 'CBE', role: 'Data Analyst', progress: 20, status: 'Delayed', reports: '3/15' },
    { name: 'Eden Kebede', org: 'Hybrid Systems', role: 'UX Intern', progress: 60, status: 'On Track', reports: '9/15' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Monitor Internship Progress</h2>
        <p className="text-slate-500 text-sm mt-1">Track completion rates and identify students requiring intervention.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {interns.map((intern, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-teal-600 transition-colors">{intern.name}</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{intern.org} • {intern.role}</p>
              </div>
              <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                intern.status === 'On Track' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {intern.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                <span>Internship Completion</span>
                <span>{intern.progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${intern.status === 'Delayed' ? 'bg-amber-500' : 'bg-teal-500'}`} 
                  style={{ width: `${intern.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Reports Submitted</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{intern.reports}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Expected End</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Jan 15, 2024</p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
               <button className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">
                 Report History
               </button>
               <button className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all shadow-lg ${
                 intern.status === 'Delayed' ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-teal-600 text-white shadow-teal-600/20'
               }`}>
                 {intern.status === 'Delayed' ? 'Flag Issues' : 'Detailed Timeline'}
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;
