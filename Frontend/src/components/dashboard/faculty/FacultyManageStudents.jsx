import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faBriefcase } from '@fortawesome/free-solid-svg-icons';

const FacultyManageStudents = () => {
  const students = [
    { name: 'Abebe Bikila', id: 'BIT/102/13', year: '4th', gpa: '3.85', eligible: true, status: 'Active' },
    { name: 'Saba Tadesse', id: 'BIT/155/13', year: '4th', gpa: '3.70', eligible: true, status: 'Active' },
    { name: 'Mulugeta Seraw', id: 'BIT/201/13', year: '4th', gpa: '3.92', eligible: true, status: 'Active' },
    { name: 'Eden Kebede', id: 'BIT/088/13', year: '4th', gpa: '3.10', eligible: false, status: 'Inactive' },
    { name: 'Tewodros Kassahun', id: 'BIT/412/13', year: '4th', gpa: '2.45', eligible: false, status: 'Active' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Manage Students</h2>
          <p className="text-slate-500 text-sm mt-1">Control eligibility, academic status, and portal access.</p>
        </div>
        <div className="flex gap-3">
          <input type="text" placeholder="Search by name or ID..." className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all w-64" />
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
            Export List
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest">Student Information</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-center">GPA</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-center">Eligibility</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((student, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-slate-800 dark:text-white">{student.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{student.id} • {student.year} Year</div>
                  </td>
                  <td className="p-5 text-center">
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">{student.gpa}</span>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      student.eligible 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {student.eligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex justify-center">
                      <span className={`w-2 h-2 rounded-full ${student.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-all">
                        <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                      </button>
                      <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all">
                        <FontAwesomeIcon icon={faBriefcase} className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacultyManageStudents;
