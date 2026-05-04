import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faBuilding, faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';

const InfoCard = ({ icon, label, value, subValue }) => (
  <div>
    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{label}</p>
    <div className="flex items-center">
      <FontAwesomeIcon icon={icon} className="w-5 h-5 text-slate-500 dark:text-slate-400 mr-3" />
      <div>
        <p className="text-sm font-bold text-slate-700 dark:text-white leading-tight">{value || 'N/A'}</p>
        {subValue && <p className="text-xs text-slate-500 dark:text-slate-400">{subValue}</p>}
      </div>
    </div>
  </div>
);

const InternshipStatus = () => {
  const { user } = useAuth();
  const [internshipData, setInternshipData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveInternship = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/myInternship`, {
           headers: { Authorization: `Bearer ${user?.token}` }
        });
        
        const data = res.data.internship || res.data.data || null;
        if (data) setInternshipData(data);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
    };
    if (user?.token) fetchActiveInternship();
  }, [user]);

  if (loading) {
     return (
        <div className="flex justify-center items-center h-64 text-blue-500 animate-fade-in">
           <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
     );
  }

  const activeStatus = (internshipData?.status || '').toLowerCase();

  if (!internshipData || (activeStatus !== 'in progress' && activeStatus !== 'accepted' && activeStatus !== 'active')) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-slate-500 animate-fade-in bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8">
         <FontAwesomeIcon icon={faBriefcase} size="3x" className="mb-4 opacity-50" />
         <p className="font-bold text-lg">No Active Placement.</p>
         <p className="text-sm mt-1">Your internship is not active yet. Apply via the Opportunities portal.</p>
      </div>
    );
  }

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
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
               {internshipData.company_name ? internshipData.company_name.charAt(0) : 'I'}
            </p>
          </div>
          <div className="flex-grow space-y-4">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">{internshipData.title}</h3>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold uppercase">{internshipData.status}</span>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700/50 grid grid-cols-1 md:grid-cols-3 gap-8">
          <InfoCard icon={faBuilding} label="Organization" value={internshipData.company_name} />
          <InfoCard icon={faUser} label="Company Supervisor" value={internshipData.company_mentor_name} subValue="Internship Supervisor" />
          <InfoCard icon={faUser} label="Assigned Mentor" value={internshipData.university_mentor_name} subValue="Faculty Advisor" />
        </div>
      </div>
    </div>
  );
};

export default InternshipStatus;
