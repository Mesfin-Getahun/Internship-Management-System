import React from 'react';
import { Briefcase, Building, User, FileText } from 'lucide-react';

const InfoCard = ({ icon: Icon, label, value, subValue }) => (
  <div>
    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{label}</p>
    <div className="flex items-center">
      <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400 mr-3" />
      <div>
        <p className="text-sm font-bold text-slate-700 dark:text-white leading-tight">{value}</p>
        {subValue && <p className="text-xs text-slate-500 dark:text-slate-400">{subValue}</p>}
      </div>
    </div>
  </div>
);

const LogItem = ({ range, date, preview }) => (
  <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
    <div className="flex justify-between items-center">
      <div>
        <p className="font-bold text-slate-700 dark:text-white">{`Weeks ${range}`}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{preview}</p>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{date}</p>
    </div>
  </div>
);

const InternshipStatus = () => {
  // This data would come from the user's context or an API call
  const internshipData = {
    title: 'Cloud Infrastructure Intern',
    company: 'Safaricom Ethiopia PLC',
    supervisor: 'Eng. Solomon Tadesse',
    supervisorRole: 'Infrastructure Lead',
    mentor: 'Dr. Samuel Ketema',
    mentorRole: 'Faculty of Computing',
    status: 'Active',
    currentWeek: 6,
    totalWeeks: 15,
    logs: [
      { range: '1-2', date: 'Oct 15, 2023', preview: 'Initial onboarding and platform architecture review.' },
      { range: '3-4', date: 'Oct 29, 2023', preview: 'Tasked with monitoring script development. Good progress.' },
      { range: '5-6', date: 'Nov 12, 2023', preview: 'Presented script to the team. Received positive feedback.' },
    ],
  };

  // A real implementation would check the user's state, e.g., from useAuth()
  // For now, we'll assume the internship is active for demonstration.
  // if (user.internshipStatus !== 'ACTIVATED') {
  //   return <div className="text-center p-12">Your internship is not active yet.</div>;
  // }

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Active Internship Status</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          An overview of your current placement and progress.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800">
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">S</p>
          </div>
          <div className="flex-grow space-y-4">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">{internshipData.title}</h3>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold uppercase">{internshipData.status}</span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-lg text-xs font-bold uppercase">
                {`Week ${internshipData.currentWeek} / ${internshipData.totalWeeks}`}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700/50 grid grid-cols-1 md:grid-cols-3 gap-8">
          <InfoCard icon={Building} label="Organization" value={internshipData.company} />
          <InfoCard icon={User} label="Company Supervisor" value={internshipData.supervisor} subValue={internshipData.supervisorRole} />
          <InfoCard icon={User} label="Assigned Mentor" value={internshipData.mentor} subValue={internshipData.mentorRole} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
          <h4 className="font-bold text-slate-700 dark:text-white uppercase text-sm tracking-wider">Supervisor Bi-Weekly Notes</h4>
          <FileText className="w-5 h-5 text-slate-400" />
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {internshipData.logs.map((log, index) => (
            <LogItem key={index} {...log} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InternshipStatus;