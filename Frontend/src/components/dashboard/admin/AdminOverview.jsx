
import React from 'react';

const AdminOverview = () => {
  const stats = [
    { label: 'Total Students', val: '4,520', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197', color: 'indigo' },
    { label: 'Total Mentors', val: '184', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'blue' },
    { label: 'Active Faculties', val: '6', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'emerald' },
    { label: 'Organizations', val: '124', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745V6a2 2 0 012-2h14a2 2 0 012 2v7.255z', color: 'slate' },
    { label: 'Active Placements', val: '842', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'indigo' },
    { label: 'Pending Orgs', val: '18', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'amber' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Performance Hub</h2>
        <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">Global control center for BiT Internship Management.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group cursor-default">
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
              </svg>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <div className="text-xl font-black text-slate-800">{stat.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col h-96">
          <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
               User Registration Growth
            </h3>
            <select className="bg-slate-50 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-100 focus:outline-none">
              <option>Last 6 Months</option>
              <option>Yearly</option>
            </select>
          </div>
          <div className="flex-grow flex items-end justify-between px-4 pb-4">
             {/* Chart Visual Placeholder */}
             {[40, 65, 55, 80, 75, 95].map((val, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                 <div className="w-3/4 bg-slate-50 rounded-xl relative h-64 flex flex-col justify-end overflow-hidden border border-slate-100">
                    <div className="w-full bg-indigo-500/20 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-full bg-indigo-600 rounded-t-lg transition-all duration-1000 group-hover:bg-indigo-700" style={{ height: `${val}%` }}></div>
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'][i]}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Platform Integrity</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">System security level: <span className="text-green-400 font-bold uppercase tracking-widest ml-1">Critical Safe</span></p>
            <div className="mt-8 space-y-6">
               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                   <span>Server Load</span>
                   <span>24%</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 w-[24%]"></div>
                 </div>
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                   <span>Storage Used</span>
                   <span>68%</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 w-[68%]"></div>
                 </div>
               </div>
            </div>
          </div>
          <div className="relative z-10 pt-10">
             <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-black/40">
               Access System Shell
             </button>
          </div>
          {/* SVG Decoration */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-[2000ms]"></div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-[0.2em]">Global Activity Monitor</h3>
          <button className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline">View Live Stream</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                <th className="p-5">Event Log</th>
                <th className="p-5">User Reference</th>
                <th className="p-5">Auth Role</th>
                <th className="p-5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { event: 'New Faculty Node Created: "Computing"', user: 'System Root', role: 'System Admin', status: 'Verified' },
                { event: 'UIL Approved Partnership with CBE Tech', user: 'Officer Yonas', role: 'UIL Officer', status: 'Authorized' },
                { event: 'Bulk Mentor Account Sync Completed', user: 'Auto Proxy', role: 'System Bot', status: 'Success' },
                { event: 'Critical DB Maintenance Hook Active', user: 'System Root', role: 'System Admin', status: 'Maintenance' }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-5 font-bold text-slate-700">{row.event}</td>
                  <td className="p-5 text-slate-500 font-medium">{row.user}</td>
                  <td className="p-5">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">{row.role}</span>
                  </td>
                  <td className="p-5 text-right font-black uppercase text-[10px] text-indigo-600 tracking-tighter">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
