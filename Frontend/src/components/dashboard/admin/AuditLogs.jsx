import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';

const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/logs`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setLogs(Array.isArray(res.data?.logs) ? res.data.logs : []);
      } catch (error) {
        console.error('Failed to load audit logs.', error);
      }
    };

    if (user?.token) {
      fetchLogs();
    }
  }, [user?.token]);

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
                  <td className="p-5 text-slate-400">{log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}</td>
                  <td className="p-5 text-slate-800 font-bold">{log.user_id || 'System'}</td>
                  <td className="p-5">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-black text-[9px] uppercase tracking-tighter border border-slate-200">{log.action}</span>
                  </td>
                  <td className="p-5 text-slate-500">system_logs</td>
                  <td className="p-5 text-right font-black tracking-widest opacity-50">N/A</td>
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
