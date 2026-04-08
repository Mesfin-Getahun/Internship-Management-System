import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import ApplicationStatusModal from './ApplicationStatusModal.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faFolderOpen } from '@fortawesome/free-solid-svg-icons';

const MyApplications = () => {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/myInternship`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        
        // Ensure we arrayify it depending on backend response shape.
        // It could be res.data.applications or res.data.internship
        const data = res.data.applications || res.data.internships || res.data.data || [];
        if (Array.isArray(data)) {
           setApplications(data);
        } else if (data) {
           setApplications([data]);
        }
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchMyApplications();
  }, [user]);

  const handleViewStatus = (app) => {
    setSelectedApplication(app);
  };

  const handleCloseModal = () => {
    setSelectedApplication(null);
  };

  return (
    <>
      <div className="animate-fade-in space-y-6">
        <header>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">My Applications</h2>
          <p className="text-slate-500 text-sm mt-1">Track your progress with partner organizations.</p>
        </header>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-blue-500">
               <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-slate-400">
               <FontAwesomeIcon icon={faFolderOpen} size="3x" className="mb-4 opacity-50" />
               <p className="font-bold">No applications found.</p>
               <p className="text-sm mt-1">Visit Internship Opportunities to apply.</p>
            </div>
          ) : (
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
                        <div className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">{app.title || 'Internship Position'}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{app.company_name || 'Organization'}</div>
                      </td>
                      <td className="p-5 text-xs text-slate-500 font-bold whitespace-nowrap">
                         {app.applied_date ? new Date(app.applied_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-5 text-center">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          app.status?.toLowerCase() === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          app.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          app.status?.toLowerCase() === 'pending' || app.status === 'Under Review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {app.status || 'Applied'}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <button 
                          onClick={() => handleViewStatus(app)}
                          className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
      <ApplicationStatusModal application={selectedApplication} onClose={handleCloseModal} />
    </>
  );
};

export default MyApplications;
