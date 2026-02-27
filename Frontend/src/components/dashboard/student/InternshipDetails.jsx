import React from 'react';
import { Briefcase, Building, User, Calendar } from 'lucide-react';

const InternshipDetails = () => {
  // Mock data - this will eventually come from props or an API call
  const details = {
    company: 'Safaricom Ethiopia',
    role: 'Software Engineering Intern',
    mentor: 'Mr. John Doe',
    duration: 'June 2024 - September 2024',
  };

  const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-800 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-lg">My Internship Details</h3>
      <div className="space-y-4">
        <DetailItem icon={<Building size={20} className="text-slate-500" />} label="Company" value={details.company} />
        <DetailItem icon={<Briefcase size={20} className="text-slate-500" />} label="Role" value={details.role} />
        <DetailItem icon={<User size={20} className="text-slate-500" />} label="Company Mentor" value={details.mentor} />
        <DetailItem icon={<Calendar size={20} className="text-slate-500" />} label="Duration" value={details.duration} />
      </div>
    </div>
  );
};

export default InternshipDetails;
