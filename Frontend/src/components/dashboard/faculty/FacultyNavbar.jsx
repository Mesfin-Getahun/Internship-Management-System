import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUniversity } from '@fortawesome/free-solid-svg-icons';
import NotificationBell from '../common/NotificationBell';

const FacultyNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50 px-8 flex items-center justify-between transition-colors ml-64">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-700/20">
          <FontAwesomeIcon icon={faUniversity} className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-xl tracking-tight text-slate-800 dark:text-white leading-none uppercase">Faculty of Computing</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded uppercase tracking-wider">Role: Faculty Admin</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">BiT Bahir Dar</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationBell accent="emerald" />
        
        <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
        
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">Academic Dean</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">BIT Admin Panel</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-emerald-500/20 overflow-hidden shadow-md group cursor-pointer hover:border-emerald-500 transition-colors">
            <img 
              src="https://ui-avatars.com/api/?name=Academic+Dean&background=047857&color=fff" 
              alt="Faculty Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FacultyNavbar;
