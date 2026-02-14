
import React, { useState } from 'react';

const MyStudents = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);

  const students = [
    { id: 'BIT/102/13', name: 'Abebe Bikila', faculty: 'Software Eng.', org: 'Ethiopian Airlines', status: 'On Track', date: 'Oct 01, 2023' },
    { id: 'BIT/155/13', name: 'Saba Tadesse', faculty: 'Software Eng.', org: 'Safaricom Ethiopia', status: 'On Track', date: 'Oct 05, 2023' },
    { id: 'BIT/201/13', name: 'Mulugeta Seraw', faculty: 'Software Eng.', org: 'CBE', status: 'Delayed', date: 'Oct 02, 2023' },
    { id: 'BIT/088/13', name: 'Eden Kebede', faculty: 'Software Eng.', org: 'Hybrid Systems', status: 'On Track', date: 'Oct 10, 2023' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Assigned Students</h2>
          <p className="text-slate-500 text-sm mt-1">Direct supervision list for Academic Year 2023/24.</p>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total: {students.length} / 10</span>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Student Information</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Organization</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Start Date</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-center whitespace-nowrap">Status</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((student, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="p-5">
                    <div className="font-bold text-slate-800 dark:text-white group-hover:text-teal-600 transition-colors">{student.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{student.id} • {student.faculty}</div>
                  </td>
                  <td className="p-5 text-sm text-slate-600 dark:text-slate-400 font-medium">{student.org}</td>
                  <td className="p-5 text-xs text-slate-500 font-bold whitespace-nowrap">{student.date}</td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      student.status === 'On Track' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' :
                      student.status === 'Delayed' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => setSelectedStudent(student)}
                      className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-slate-200 dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-teal-600/20">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-none">{selectedStudent.name}</h3>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">{selectedStudent.id}</p>
                  <p className="text-xs text-teal-600 font-bold mt-1 uppercase tracking-tighter">Software Engineering Student</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Organization</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedStudent.org}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Internship Role</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Junior Full-Stack Developer</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Supervision Type</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Academic Guidance</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Academic Status</p>
                  <p className="text-sm font-bold text-teal-600">Eligible for Credit</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Academic Performance</h4>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">3.85</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Cumulative GPA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">4th Year, 2nd Sem</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Enrollment Phase</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 pt-0 flex gap-3">
              <button className="flex-1 py-4 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-50 transition-colors">
                View Transcripts
              </button>
              <button className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 shadow-xl shadow-teal-500/20 transition-all active:scale-95">
                Message Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyStudents;
