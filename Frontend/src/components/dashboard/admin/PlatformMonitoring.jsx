import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PlatformMonitoring = () => {
  const { user } = useAuth();
  const [monitoring, setMonitoring] = useState(null);
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);

  const fetchMonitoring = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/monitoring`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setMonitoring(res.data?.monitoring || null);
    } catch (error) {
      console.error('Failed to load platform monitoring.', error);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchMonitoring();
    }
  }, [user?.token]);

  const handleMaintenanceToggle = async () => {
    if (!user?.token || !monitoring) {
      return;
    }

    try {
      setIsTogglingMaintenance(true);
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/maintenance`,
        { maintenance_mode: !monitoring?.maintenance_mode },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      await fetchMonitoring();
      toast.success(
        `Maintenance mode ${monitoring.maintenance_mode ? 'disabled' : 'enabled'} successfully.`,
      );
    } catch (error) {
      console.error('Failed to toggle maintenance mode.', error);
      toast.error(error.response?.data?.message || 'Failed to toggle maintenance mode.');
    } finally {
      setIsTogglingMaintenance(false);
    }
  };

  const cardData = [
    { label: 'Cloud Host', val: monitoring?.host_status || 'Unknown', sub: 'Primary node', color: 'green' },
    { label: 'Database', val: monitoring?.database_status || 'Unknown', sub: 'MySQL connectivity', color: 'green' },
    { label: 'API Latency', val: `${monitoring?.api_latency_ms ?? 0}ms`, sub: 'Estimated response time', color: 'blue' },
    { label: 'Storage', val: `${monitoring?.storage_used_percent ?? 0}%`, sub: 'Backup directory footprint', color: 'amber' }
  ];

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <ToastContainer theme="dark" position="bottom-right" />
      <header>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Resource Monitor</h2>
        <p className="text-slate-500 text-sm mt-1 uppercase text-[10px] font-bold tracking-widest">Real-time Node Health</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((h, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className={`w-2 h-full absolute left-0 top-0 bg-${h.color}-500 transition-all duration-700 group-hover:w-3`}></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-2">{h.label}</p>
            <div className="text-2xl font-black text-slate-800 pl-2">{h.val}</div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 pl-2">{h.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden border border-slate-800 shadow-2xl">
         <div className="relative z-10 flex flex-col md:flex-row justify-between gap-12">
            <div className="flex-1 space-y-8">
               <h3 className="text-2xl font-black tracking-tight">Technical Diagnostics</h3>
               <div className="space-y-6">
                 <div className="space-y-3">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                     <span>Maintenance Mode</span>
                     <span className={monitoring?.maintenance_mode ? 'text-amber-400' : 'text-emerald-400'}>
                       {monitoring?.maintenance_mode ? 'Enabled' : 'Disabled'}
                     </span>
                   </div>
                   <button
                     onClick={handleMaintenanceToggle}
                     disabled={isTogglingMaintenance || !monitoring}
                     className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                   >
                     {isTogglingMaintenance
                       ? 'Updating Maintenance...'
                       : monitoring?.maintenance_mode
                         ? 'Disable Maintenance'
                         : 'Enable Maintenance'}
                   </button>
                 </div>
                 <div className="space-y-3">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                     <span>CPU Utilization</span>
                     <span className="text-indigo-400">{monitoring?.cpu_percent ?? 0}%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-800 rounded-full">
                     <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${monitoring?.cpu_percent ?? 0}%` }}></div>
                   </div>
                 </div>
                 <div className="space-y-3">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                     <span>RAM Consumption</span>
                     <span className="text-blue-400">
                       {monitoring ? `${(monitoring.ram_used_bytes / (1024 ** 3)).toFixed(1)}GB / ${(monitoring.ram_total_bytes / (1024 ** 3)).toFixed(1)}GB` : '0GB / 0GB'}
                     </span>
                   </div>
                   <div className="h-2 w-full bg-slate-800 rounded-full">
                     <div
                       className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                       style={{
                         width: `${monitoring ? Math.round((monitoring.ram_used_bytes / Math.max(monitoring.ram_total_bytes, 1)) * 100) : 0}%`
                       }}
                     ></div>
                   </div>
                 </div>
               </div>
            </div>
            <div className="flex-1 bg-white/5 rounded-3xl p-8 backdrop-blur-md border border-white/10 flex flex-col justify-center text-center">
               <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Live Throughput</div>
               <div className="text-5xl font-black text-white font-mono tracking-tighter">{monitoring?.throughput_rps ?? 0} <span className="text-lg opacity-40">req/s</span></div>
               <div className="mt-8 flex justify-center gap-2">
                 {[40, 60, 45, 90, 80, 50, 70, 30, 85].map((v, i) => (
                   <div key={i} className="w-1.5 bg-indigo-500/40 rounded-full relative" style={{ height: '40px' }}>
                      <div className="absolute bottom-0 w-full bg-indigo-400 rounded-full animate-pulse" style={{ height: `${v}%`, animationDelay: `${i*100}ms` }}></div>
                   </div>
                 ))}
               </div>
            </div>
         </div>
         {/* Grid Decoration */}
         <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>
    </div>
  );
};

export default PlatformMonitoring;
