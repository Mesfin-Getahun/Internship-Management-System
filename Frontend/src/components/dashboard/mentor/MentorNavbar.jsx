import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardTeacher, faBell } from '@fortawesome/free-solid-svg-icons';

const MentorNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50 px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-600/20">
          <FontAwesomeIcon icon={faChalkboardTeacher} className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-xl tracking-tight text-slate-800 dark:text-white leading-none uppercase">BiT Mentor Portal</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 text-[10px] font-black rounded uppercase tracking-wider">Role: Academic Mentor</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Bahir Dar University</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
          <FontAwesomeIcon icon={faBell} className="h-6 w-6" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 group-hover:scale-125 transition-transform"></span>
        </button>
        
        <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
        
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">Dr. Samuel Ketema</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">Software Engineering</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-teal-500/20 overflow-hidden shadow-md group cursor-pointer hover:border-teal-500 transition-colors">
            <img 
              src="https://ui-avatars.com/api/?name=Samuel+Ketema&background=0D9488&color=fff" 
              alt="Mentor Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MentorNavbar;
