
import React from 'react';

const OrgVacancies = () => {
  const vacancies = [
    { title: 'Full Stack Web Intern', dept: 'Software Engineering', apps: 12, status: 'Active', posted: '3 days ago' },
    { title: 'Structure Design Intern', dept: 'Civil Engineering', apps: 8, status: 'Draft', posted: 'Just now' },
    { title: 'Embedded Systems Trainee', dept: 'Electrical Engineering', apps: 0, status: 'Draft', posted: 'Yesterday' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Internship Vacancies</h2>
          <p className="text-slate-500 text-sm mt-1">Manage, edit and track performance of your job postings.</p>
        </div>
        <button className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Post New Vacancy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vacancies.map((v, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800/50 transition-all">
            <div className="flex justify-between items-start mb-6">
              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                v.status === 'Active' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
              }`}>
                {v.status}
              </span>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{v.posted}</p>
            </div>
            
            <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">{v.title}</h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-8 uppercase tracking-wide">{v.dept}</p>
            
            <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-800 dark:text-white">{v.apps}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Applicants</span>
              </div>
              <button className="p-3 bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrgVacancies;
