
import React from 'react';

const InternshipMonitoring = () => {
  const data = [
    { name: 'Abebe Bikila', id: 'BIT/102/13', faculty: 'Computing', org: 'EAL Group', mentor: 'Dr. Belayneh', status: 'Active', prog: 65 },
    { name: 'Saba Tadesse', id: 'BIT/155/13', faculty: 'Civil', org: 'Safaricom', mentor: 'Eng. Solomon', status: 'Active', prog: 40 },
    { name: 'Mulugeta Seraw', id: 'BIT/201/13', faculty: 'Electrical', org: 'CBE', mentor: 'Dr. Yilma', status: 'Active', prog: 20 },
    { name: 'Eden Kebede', id: 'BIT/088/13', faculty: 'Computing', org: 'Hybrid Sys.', mentor: 'Dr. Belayneh', status: 'Completed', prog: 100 },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Internship Oversight</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time tracking of all active university internship placements.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="text" placeholder="Filter by Student ID..." className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none w-48" />
          <button className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">Search</button>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="p-5">Student Entity</th>
                <th className="p-5">Faculty / Org</th>
                <th className="p-5">Mentor</th>
                <th className="p-5">Completion</th>
                <th className="p-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <td className="p-5">
                    <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{row.name}</div>
                    <div className="text-[11px] text-slate-400 font-medium font-mono">{row.id}</div>
                  </td>
                  <td className="p-5">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-tighter">{row.faculty}</div>
                    <div className="text-[11px] text-slate-400 font-medium uppercase mt-0.5">{row.org}</div>
                  </td>
                  <td className="p-5 text-slate-500 font-bold text-xs">{row.mentor}</td>
                  <td className="p-5 w-48">
                    <div className="flex items-center gap-3">
                      <div className="flex-grow h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${row.prog === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${row.prog}%` }}></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 shrink-0">{row.prog}%</span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${row.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {row.status}
                    </span>
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

export default InternshipMonitoring;
