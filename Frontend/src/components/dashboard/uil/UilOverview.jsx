
import React from 'react';

const UilOverview = () => {
  const stats = [
    { label: 'Total Organizations', val: '124', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', trend: '+5%', color: 'indigo' },
    { label: 'Pending Approvals', val: '18', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', trend: 'High', color: 'amber' },
    { label: 'Active Internships', val: '842', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745V6a2 2 0 012-2h14a2 2 0 012 2v7.255z', trend: '+12%', color: 'blue' },
    { label: 'Total Placed', val: '1,205', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', trend: '94%', color: 'teal' },
    { label: 'Completed', val: '548', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', trend: 'Semesterly', color: 'emerald' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Oversight</h2>
          <p className="text-slate-500 font-medium mt-1">Institutional monitoring of university-industry linkages.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-100 transition-all border border-indigo-200/50">Export Global Stats</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
              </svg>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">{stat.label}</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-slate-800">{stat.val}</span>
              <span className={`text-[10px] font-bold text-${stat.color}-600 px-2 py-0.5 bg-${stat.color}-50 rounded-lg`}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simplified Visualization Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 h-96 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-800">Placement Distribution by Faculty</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div><span className="text-[10px] font-black uppercase text-slate-400">Target</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-200"></div><span className="text-[10px] font-black uppercase text-slate-400">Actual</span></div>
            </div>
          </div>
          <div className="flex-grow flex items-end gap-6 px-4">
             {[
               { f: 'Computing', val: 90 }, { f: 'Civil', val: 75 }, { f: 'Mech', val: 60 }, { f: 'Elect', val: 85 }, { f: 'Chem', val: 45 }, { f: 'Others', val: 55 }
             ].map((item, idx) => (
               <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                 <div className="w-full bg-slate-50 rounded-xl relative h-full flex flex-col justify-end overflow-hidden border border-slate-100">
                    <div className="w-full bg-indigo-500 transition-all duration-1000 group-hover:bg-indigo-600" style={{ height: `${item.val}%` }}></div>
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter text-center h-4">{item.f}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h3 className="font-bold text-slate-800 mb-6">System Health</h3>
            <div className="space-y-6">
              {[
                { label: 'DB Connectivity', status: 'Operational', color: 'green' },
                { label: 'Portal Traffic', status: 'Moderate', color: 'indigo' },
                { label: 'Notification Service', status: 'Operational', color: 'green' }
              ].map((sys, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">{sys.label}</span>
                  <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase text-${sys.color}-600`}>
                    <span className={`w-2 h-2 rounded-full bg-${sys.color}-500 animate-pulse`}></span>
                    {sys.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-2">UIL Report Engine</h4>
              <p className="text-indigo-300 text-xs leading-relaxed mb-6">Generate semester-end fulfillment analytics for the university board.</p>
              <button className="w-full py-3 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl shadow-black/20">
                Run Analytics
              </button>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Global Audit Trail</h3>
          <button className="text-indigo-600 text-xs font-bold hover:underline">View System Logs</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Institutional Event</th>
                <th className="p-4">Principal</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {[
                { time: '14:22 Oct 26', event: 'New Organization Partnership Approved', principal: 'EAL Group', status: 'Success' },
                { time: '09:05 Oct 26', event: 'Internship Grade Audit Generated', principal: 'Faculty of Computing', status: 'Generated' },
                { time: '17:45 Oct 25', event: 'Mentorship Capacity Override', principal: 'Officer Yonas', status: 'Warning' },
                { time: '11:12 Oct 25', event: 'System Maintenance Window Closed', principal: 'Admin Root', status: 'Success' }
              ].map((log, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono text-[11px] text-slate-400">{log.time}</td>
                  <td className="p-4 font-bold text-slate-700">{log.event}</td>
                  <td className="p-4 text-slate-500 font-medium">{log.principal}</td>
                  <td className="p-4 text-right">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${log.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {log.status}
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

export default UilOverview;
