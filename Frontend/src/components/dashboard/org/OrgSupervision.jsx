
import React from 'react';

const OrgSupervision = () => {
  const interns = [
    { name: 'Abebe Bikila', mentor: 'Dr. Belayneh', start: 'Oct 01, 2023', end: 'Jan 01, 2024', progress: 65, reports: 6, pending: 1 },
    { name: 'Saba Tadesse', mentor: 'Eng. Solomon', start: 'Oct 05, 2023', end: 'Jan 05, 2024', progress: 40, reports: 4, pending: 0 },
    { name: 'Eden Kebede', mentor: 'Unassigned', start: 'Oct 10, 2023', end: 'Jan 10, 2024', progress: 15, reports: 1, pending: 2 },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Internship Supervision</h2>
        <p className="text-slate-500 text-sm mt-1">Monitor progress and weekly report submissions of your assigned interns.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {interns.map((intern, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {intern.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">{intern.name}</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Mentor: {intern.mentor}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                intern.progress > 50 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {intern.progress}% Complete
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Duration</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">{intern.start} - {intern.end}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Report Status</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">{intern.reports} Submitted / {intern.pending} Pending</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                <span>Internship Progress</span>
                <span>{intern.progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${intern.progress}%` }}></div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                View Reports
              </button>
              <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                Contact Intern
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrgSupervision;
