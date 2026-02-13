
import React from 'react';

const AuditLogs = () => {
  const logs = [
    { ts: '2023-11-20 14:22:12', admin: 'Root_Sys', action: 'SCHEMA_UPDATE', entity: 'Role_Faculty', ip: '192.168.1.1' },
    { ts: '2023-11-20 12:05:55', admin: 'Root_Sys', action: 'BACKUP_GENERATE', entity: 'System_DB', ip: '192.168.1.1' },
    { ts: '2023-11-20 09:44:02', admin: 'Root_Sys', action: 'USER_ROLE_CHANGE', entity: 'yonas.uil', ip: '10.0.0.12' },
    { ts: '2023-11-19 17:12:30', admin: 'Auto_Agent', action: 'INDEX_REBUILD', entity: 'Student_Records', ip: 'Localhost' },
    { ts: '2023-11-19 15:30:11', admin: 'Root_Sys', action: 'FACULTY_CREATE', entity: 'Computing', ip: '192.168.1.1' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Technical Audit Logs</h2>
          <p className="text-slate-500 text-sm mt-1 uppercase text-[10px] font-bold tracking-widest">Security Forensics & Event History</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">Download PDF Report</button>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex gap-4 bg-slate-50/50">
           <input type="text" placeholder="Filter Action Code..." className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none w-48" />
           <input type="date" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                <th className="p-5">ISO Timestamp</th>
                <th className="p-5">Security Principal</th>
                <th className="p-5">Action Identifier</th>
                <th className="p-5">Target Node</th>
                <th className="p-5 text-right">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-mono">
              {logs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 text-slate-400">{log.ts}</td>
                  <td className="p-5 text-slate-800 font-bold">{log.admin}</td>
                  <td className="p-5">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-black text-[9px] uppercase tracking-tighter border border-slate-200">{log.action}</span>
                  </td>
                  <td className="p-5 text-slate-500">{log.entity}</td>
                  <td className="p-5 text-right font-black tracking-widest opacity-50">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
