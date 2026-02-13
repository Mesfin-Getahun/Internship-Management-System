
import React, { useState } from 'react';

const ManageFaculties = () => {
  const [faculties, setFaculties] = useState([
    { name: 'Faculty of Computing', code: 'BIT-CS', dean: 'Dr. Samuel K.', students: 1250, status: 'Active' },
    { name: 'Faculty of Civil Engineering', code: 'BIT-CE', dean: 'Eng. Solomon T.', students: 980, status: 'Active' },
    { name: 'Faculty of Electrical Eng.', code: 'BIT-EE', dean: 'Dr. Yilma B.', students: 1100, status: 'Active' },
    { name: 'Faculty of Mechanical Eng.', code: 'BIT-ME', dean: 'Eng. Martha G.', students: 850, status: 'Inactive' },
  ]);

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Faculty Management</h2>
          <p className="text-slate-500 text-sm mt-1 uppercase text-[10px] font-bold tracking-widest">Institutional Hierarchy Control</p>
        </div>
        <button className="px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Faculty
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="p-5">Faculty Entity</th>
                <th className="p-5">Dean / Responsibility</th>
                <th className="p-5 text-center">Enrollment</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {faculties.map((f, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5">
                    <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{f.name}</div>
                    <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-0.5">{f.code}</div>
                  </td>
                  <td className="p-5 text-slate-600 font-medium">{f.dean}</td>
                  <td className="p-5 text-center font-bold text-slate-700">{f.students.toLocaleString()}</td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      f.status === 'Active' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-2.5 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                       </button>
                       <button className="p-2.5 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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

export default ManageFaculties;
