import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBolt } from '@fortawesome/free-solid-svg-icons';

const AdminNavbar = ({ title }) => {
  return (
    <nav className="fixed top-0 left-64 right-0 h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 z-50 px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-8 flex-grow">
        <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">{title}</h1>
        
        <div className="relative w-full max-w-lg hidden lg:block">
          <FontAwesomeIcon icon={faSearch} className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
          <FontAwesomeIcon icon={faBolt} className="h-6 w-6" />
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
