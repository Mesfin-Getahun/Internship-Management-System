import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faFileAlt, faUsers, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const OrgOverview = () => {
  const stats = [
    { label: 'Active Vacancies', val: '4', color: 'blue', icon: faBriefcase },
    { label: 'Total Applications', val: '28', color: 'emerald', icon: faFileAlt },
    { label: 'Current Interns', val: '12', color: 'amber', icon: faUsers }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Good Morning, Ethiopian Airlines</h2>
        <p className="text-slate-500 text-sm mt-1">Here is what's happening with your internship programs today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-4xl font-black mt-2 text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{stat.val}</p>
              </div>
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                <FontAwesomeIcon icon={stat.icon} className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800/30 p-6 rounded-3xl flex items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
          <FontAwesomeIcon icon={faInfoCircle} className="h-8 w-8 animate-pulse" />
        </div>
        <div>
          <h4 className="font-bold text-amber-900 dark:text-amber-400">Account Verification in Progress</h4>
          <p className="text-sm text-amber-700 dark:text-amber-500/80 max-w-2xl leading-relaxed">
            UIL Officers are currently validating your documentation. During this phase, you can create and manage vacancy drafts, but they will not be visible to students in the public marketplace.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Student Applications</h3>
          <button className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">View All Applications</button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[
            { name: 'Abebe Bikila', role: 'Software Engineer Intern', date: '2 hours ago', gpa: '3.85', img: 'AB' },
            { name: 'Mulugeta Seraw', role: 'UX Designer Intern', date: '5 hours ago', gpa: '3.92', img: 'MS' },
            { name: 'Saba Tadesse', role: 'Civil Engineering Trainee', date: 'Yesterday', gpa: '3.70', img: 'ST' }
          ].map((app, i) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform">
                  {app.img}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">{app.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{app.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-blue-600 dark:text-blue-400">GPA {app.gpa}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">{app.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrgOverview;
