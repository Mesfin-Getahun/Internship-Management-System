
import React from 'react';

const RoleCard = ({ role, description, icon, onClick }) => {
  return (
    <div 
      onClick={() => onClick(role)}
      className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 cursor-pointer group flex flex-col h-full active:scale-95 relative overflow-hidden"
    >
      <div className="mb-6 w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
        {role}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
        {description}
      </p>
      <div className="flex items-center text-blue-600 dark:text-blue-400 font-bold text-sm group-hover:translate-x-2 transition-transform">
        Enter Portal
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </div>
      
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 dark:bg-blue-400/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
    </div>
  );
};

export default RoleCard;
