
import React from 'react';

const AdminNavbar = ({ title }) => {
  return (
    <nav className="fixed top-0 left-64 right-0 h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 z-50 px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-8 flex-grow">
        <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">{title}</h1>
        
        <div className="relative w-full max-w-lg hidden lg:block">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search across the entire system database..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
           <span className="w-2 h-2 rounded-full bg-green-500"></span>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sys OK</span>
        </div>

        <button className="relative p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white group-hover:scale-125 transition-transform"></span>
        </button>
        
        <div className="h-10 w-px bg-slate-200 mx-2"></div>
        
        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">Admin Super</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Global Administrator</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-slate-900 border-2 border-indigo-500/20 overflow-hidden shadow-sm group-hover:border-indigo-500 transition-all">
            <img 
              src="https://ui-avatars.com/api/?name=System+Admin&background=1e293b&color=fff" 
              alt="Admin Avatar" 
              className="w-full h-full object-cover opacity-90"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
