
import React, { useState } from 'react';

const FacultyAssignMentors = () => {
  const [unassignedStudents, setUnassignedStudents] = useState([
    { name: 'Abebe Bikila', id: 'BIT/102/13', dept: 'Software Eng.' },
    { name: 'Eden Kebede', id: 'BIT/088/13', dept: 'Electrical Eng.' },
    { name: 'Saba Tadesse', id: 'BIT/155/13', dept: 'Civil Eng.' }
  ]);

  const mentors = [
    { name: 'Dr. Belayneh', dept: 'Software Eng.', load: 8 },
    { name: 'Eng. Solomon', dept: 'Civil Eng.', load: 4 },
    { name: 'Dr. Yilma', dept: 'Electrical Eng.', load: 9 },
    { name: 'Prof. Martha', dept: 'Chemical Eng.', load: 0 }
  ];

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Assign Mentors</h2>
        <p className="text-slate-500 text-sm mt-1">Connect students with academic mentors for technical guidance.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Panel: Students */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="font-bold text-slate-800 dark:text-white">Pending Assignments</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{unassignedStudents.length} Students Needing Mentors</p>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {unassignedStudents.map((s, i) => (
              <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:border-emerald-300 transition-all group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center font-black text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{s.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{s.dept}</p>
                  </div>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500 border-slate-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Mentors */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="font-bold text-slate-800 dark:text-white">Available Mentors</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Faculty Supervision Load</p>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {mentors.map((m, i) => (
              <div key={i} className={`p-5 rounded-2xl border transition-all ${
                m.load >= 10 
                  ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 opacity-60' 
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-emerald-500/30'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{m.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{m.dept}</p>
                  </div>
                  <button 
                    disabled={m.load >= 10}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      m.load >= 10 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20'
                    }`}
                  >
                    Assign
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400 uppercase">Student Load</span>
                    <span className={m.load >= 9 ? 'text-red-500' : 'text-emerald-500'}>{m.load} / 10</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${m.load >= 9 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${m.load * 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyAssignMentors;
