
import React, { useState } from 'react';

const WeeklyReports = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF or DOC files are allowed.');
      setSelectedFile(null);
      return;
    }

    setError('');
    setSelectedFile(file);
  };

  const weeks = [
    { week: 1, status: 'Submitted', date: 'Oct 08, 2023', comment: 'Excellent technical detail.' },
    { week: 2, status: 'Submitted', date: 'Oct 15, 2023', comment: 'On track.' },
    { week: 3, status: 'Pending', date: '-', comment: '-' },
    { week: 4, status: 'Pending', date: '-', comment: '-' },
  ];

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Weekly Internship Reports</h2>
        <p className="text-slate-500 text-sm mt-1">Upload your weekly task logs for mentor and faculty review.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
               <h4 className="font-bold text-slate-800 dark:text-white">Submission History</h4>
             </div>
             <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
               {weeks.map((w) => (
                 <div key={w.week} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-colors ${
                        w.status === 'Submitted' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        W{w.week}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">Week {w.week} Report</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          Status: <span className={w.status === 'Submitted' ? 'text-emerald-500' : 'text-amber-500'}>{w.status}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-bold mb-1">{w.date}</p>
                      {w.status === 'Submitted' && <button className="text-blue-600 text-[10px] font-black uppercase hover:underline">View PDF</button>}
                    </div>
                 </div>
               ))}
             </div>
           </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Submit New Report</h4>
            <form className="space-y-6" onSubmit={e => e.preventDefault()}>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Week</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                    <option>Week 3 (Current)</option>
                    <option>Week 4</option>
                  </select>
               </div>

               <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center group hover:border-blue-400 transition-colors cursor-pointer relative">
                  <input type="file" id="report-file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-300 group-hover:text-blue-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {selectedFile ? selectedFile.name : 'Upload PDF or DOC'}
                  </p>
               </div>
               
               {error && <p className="text-[10px] text-red-500 font-bold uppercase text-center">{error}</p>}

               <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50" disabled={!selectedFile}>
                 Submit Report
               </button>
            </form>
          </div>
          
          <div className="p-6 bg-slate-900 dark:bg-slate-800 text-white rounded-3xl shadow-xl relative overflow-hidden group">
            <h5 className="font-bold mb-2">Academic Credit Notice</h5>
            <p className="text-slate-400 text-xs leading-relaxed">Weekly reports account for 40% of your total internship grade. Consistency is key for academic fulfillment.</p>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReports;
