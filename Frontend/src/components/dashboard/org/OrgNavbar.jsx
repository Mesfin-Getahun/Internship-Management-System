
import React from 'react';

const OrgNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20">B</div>
        <div className="flex flex-col">
          <span className="font-extrabold text-xl tracking-tight text-slate-800 dark:text-white leading-none">Organization</span>
          <span className="text-blue-600 font-bold text-xs uppercase tracking-widest mt-0.5">Partner Portal</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex flex-col items-end mr-2">
          <p className="text-sm font-bold text-slate-800 dark:text-white">Ethiopian Airlines Group</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <p className="text-[10px] uppercase tracking-widest font-bold text-amber-500">Awaiting Verification</p>
          </div>
        </div>
        <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-800 p-0.5 ring-2 ring-blue-500/20 shadow-lg">
          <img 
            className="w-full h-full rounded-full object-cover" 
            src="https://ui-avatars.com/api/?name=Ethiopian+Airlines&background=0D8ABC&color=fff" 
            alt="Company Logo" 
          />
        </div>
      </div>
    </nav>
  );
};

export default OrgNavbar;
