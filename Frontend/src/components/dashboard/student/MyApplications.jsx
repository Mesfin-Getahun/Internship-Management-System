
import React from 'react';

const MyApplications = () => {
  const applications = [
    { title: 'Software Engineering Intern', org: 'Ethiopian Airlines', date: 'Oct 22, 2023', status: 'Accepted' },
    { title: 'Full Stack Web Intern', org: 'Safaricom Ethiopia', date: 'Oct 20, 2023', status: 'Pending' },
    { title: 'Cloud Systems Assistant', org: 'Hybrid Systems', date: 'Oct 18, 2023', status: 'Rejected' },
    { title: 'Network Admin Trainee', org: 'Ethio Telecom', date: 'Oct 15, 2023', status: 'Accepted' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">My Applications</h2>
        <p className="text-slate-500 text-sm mt-1">Track your progress with partner organizations.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Role / Organization</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Applied Date</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-center whitespace-nowrap">Status</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {applications.map((app, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="p-5">
                    <div className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">{app.title}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{app.org}</div>
                  </td>
                  <td className="p-5 text-xs text-slate-500 font-bold whitespace-nowrap">{app.date}</td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      app.status === 'Accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      app.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all active:scale-95">
                      View Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-8 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-3xl">
        <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-4">Application Policy</h4>
        <ul className="space-y-2">
          {['Students can apply to multiple internships simultaneously.', 'Once submitted, applications cannot be edited.', 'If accepted by multiple orgs, you must coordinate with Faculty for placement.'].map((text, i) => (
            <li key={i} className="flex items-start gap-3 text-xs text-blue-600 dark:text-blue-500 leading-relaxed font-medium">
              <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MyApplications;
