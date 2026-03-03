import React from 'react';

const OrgSupervisorNavbar = () => {
  return (
    <nav className="fixed top-0 left-64 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Supervisor Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Welcome, Supervisor!</p>
      </div>
    </nav>
  );
};

export default OrgSupervisorNavbar;
