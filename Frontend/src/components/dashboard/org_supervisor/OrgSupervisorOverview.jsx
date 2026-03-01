import React from 'react';

const OrgSupervisorOverview = () => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome, Supervisor!</h2>
      <p className="text-slate-500 text-sm mt-1">This is your dashboard to manage assigned students.</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder cards */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Assigned Students</h3>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">5</p>
          <p className="text-xs text-slate-500 mt-1">students currently under your supervision.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Pending Feedbacks</h3>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">2</p>
          <p className="text-xs text-slate-500 mt-1">bi-weekly feedback reports are due.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Attendance Issues</h3>
          <p className="text-3xl font-extrabold text-red-600 mt-2">1</p>
          <p className="text-xs text-slate-500 mt-1">student with attendance below 85%.</p>
        </div>
      </div>
    </div>
  );
};

export default OrgSupervisorOverview;
