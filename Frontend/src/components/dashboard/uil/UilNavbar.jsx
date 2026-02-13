
import React from 'react';

const UilNavbar = ({ title }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-8 flex items-center justify-between transition-colors ml-64">
      <div className="flex items-center gap-8 flex-grow">
        <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">{title}</h1>
        
        <div className="relative w-full max-w-md hidden md:block">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search organizations, students, or reports..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 shrink-0">
        <button className="relative p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white group-hover:scale-125 transition-transform"></span>
        </button>
        
        <div className="h-10 w-px bg-slate-200 mx-2"></div>
        
        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">Officer Yonas</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">UIL Lead Coordinator</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-indigo-100 border-2 border-indigo-500/20 overflow-hidden shadow-sm group-hover:border-indigo-500 transition-all">
            <img 
              src="https://ui-avatars.com/api/?name=UIL+Officer&background=4F46E5&color=fff" 
              alt="UIL Officer" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UilNavbar;
