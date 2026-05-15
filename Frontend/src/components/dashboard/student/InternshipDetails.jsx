import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faBuilding, faUser, faCalendarAlt, faUniversity } from '@fortawesome/free-solid-svg-icons';
import { getInternshipProgressState } from '../../../utils/internshipProgress';

const InternshipDetails = ({ internship }) => {
  if (!internship) return null;

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

  const duration = internship.start_date && internship.end_date 
     ? `${new Date(internship.start_date).toLocaleDateString()} - ${new Date(internship.end_date).toLocaleDateString()}` 
     : 'Duration Not Specified';
  const progressState = getInternshipProgressState(internship);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-lg">My Internship Details</h3>
      <div className="mb-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span>Internship Progress</span>
          <span>{progressState.label} - {progressState.progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${progressState.dormant ? 'bg-slate-400' : 'bg-blue-500'}`}
            style={{ width: `${progressState.progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{progressState.message}</p>
      </div>
      <div className="space-y-4">
        <DetailItem icon={<FontAwesomeIcon icon={faBuilding} size={20} className="text-slate-500" />} label="Company" value={internship.company_name || 'Organization'} />
        <DetailItem icon={<FontAwesomeIcon icon={faBriefcase} size={20} className="text-slate-500" />} label="Role" value={internship.title || 'Intern'} />
        <DetailItem icon={<FontAwesomeIcon icon={faUniversity} size={20} className="text-slate-500" />} label="Faculty" value={internship.faculty || 'Unassigned'} />
        <DetailItem icon={<FontAwesomeIcon icon={faUser} size={20} className="text-slate-500" />} label="Company Mentor" value={internship.company_mentor_name || 'Unassigned'} />
        <DetailItem icon={<FontAwesomeIcon icon={faCalendarAlt} size={20} className="text-slate-500" />} label="Duration" value={duration} />
      </div>
    </div>
  );
};

export default InternshipDetails;
