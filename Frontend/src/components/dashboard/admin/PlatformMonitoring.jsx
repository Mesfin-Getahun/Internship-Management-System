
import React from 'react';

const PlatformMonitoring = () => {
  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Resource Monitor</h2>
        <p className="text-slate-500 text-sm mt-1 uppercase text-[10px] font-bold tracking-widest">Real-time Node Health</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Cloud Host', val: 'Online', sub: 'AWS ap-south-1', color: 'green' },
          { label: 'Database', val: 'Connected', sub: 'Replica Set: Ready', color: 'green' },
          { label: 'API Latency', val: '42ms', sub: 'P95 Performance', color: 'blue' },
          { label: 'Storage', val: '64%', sub: 'EBS Volume v2', color: 'amber' }
        ].map((h, i) => (
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
                     <span>CPU Utilization</span>
                     <span className="text-indigo-400">32.4%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-800 rounded-full">
                     <div className="h-full bg-indigo-500 rounded-full w-[32%] transition-all duration-1000"></div>
                   </div>
                 </div>
                 <div className="space-y-3">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                     <span>RAM Consumption</span>
                     <span className="text-blue-400">4.2GB / 8GB</span>
                   </div>
                   <div className="h-2 w-full bg-slate-800 rounded-full">
                     <div className="h-full bg-blue-500 rounded-full w-[52.5%] transition-all duration-1000"></div>
                   </div>
                 </div>
               </div>
            </div>
            <div className="flex-1 bg-white/5 rounded-3xl p-8 backdrop-blur-md border border-white/10 flex flex-col justify-center text-center">
               <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Live Throughput</div>
               <div className="text-5xl font-black text-white font-mono tracking-tighter">1.8k <span className="text-lg opacity-40">req/s</span></div>
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
