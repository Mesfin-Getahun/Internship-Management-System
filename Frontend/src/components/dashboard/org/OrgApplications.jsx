import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../AuthContext';
import ApplicantDetailModal from './ApplicantDetailModal.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faInbox } from '@fortawesome/free-solid-svg-icons';

const OrgApplications = () => {
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company/getApplications`, {
         headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.data.applications) {
         setApplications(res.data.applications);
      } else if (Array.isArray(res.data)) {
         setApplications(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      toast.error("Failed to load applications. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchApplications();
  }, [user]);

  const handleViewDetails = (app) => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/company/viewApplication/${app.application_id || app.id}`,
          {
            headers: { Authorization: `Bearer ${user?.token}` }
          }
        );
        setSelectedApplicant({ ...app, ...(res.data?.application || {}) });
        setIsModalOpen(true);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Failed to load application details.');
      }
    };
    fetchDetail();
  };

  const handleAction = async (status) => {
    if (!selectedApplicant) return;
    try {
      if (status === 'Approved' || status === 'Accepted') {
         await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/company/accept/${selectedApplicant.application_id || selectedApplicant.id}`, {}, {
            headers: { Authorization: `Bearer ${user?.token}` }
         });
         toast.success(`Application for ${selectedApplicant.student_name || 'student'} accepted.`);
      } else if (status === 'Rejected') {
         await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/company/reject/${selectedApplicant.application_id || selectedApplicant.id}`, {}, {
            headers: { Authorization: `Bearer ${user?.token}` }
         });
         toast.warn(`Application for ${selectedApplicant.student_name || 'student'} rejected.`);
      }
      
      setIsModalOpen(false);
      setSelectedApplicant(null);
      fetchApplications(); // refresh list
    } catch (err) {
      console.error(`Failed to ${status} application`, err);
      toast.error(`Error applying action. Please try again.`);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Review Applications</h2>
          <p className="text-slate-500 text-sm mt-1">Review student applications and supporting academic documents.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <select className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Internships</option>
          </select>
          <select className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm min-h-[300px]">
         {loading ? (
            <div className="flex justify-center items-center h-64 text-blue-500">
               <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            </div>
         ) : applications.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-slate-400">
               <FontAwesomeIcon icon={faInbox} size="3x" className="mb-4 opacity-50 text-slate-300" />
               <p className="font-bold text-lg text-slate-700 dark:text-white">No applications received yet.</p>
               <p className="text-sm mt-1">Wait for students to apply to your active vacancies.</p>
            </div>
         ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Student Name</th>
                    <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Faculty</th>
                    <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Internship Title</th>
                    <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Date</th>
                    <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-center whitespace-nowrap">Status</th>
                    <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applications.map((app) => (
                    <tr key={app.application_id || app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="p-5">
                        <div className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                           {app.student_name || app.name || 'Anonymous Student'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                           ID: {app.student_id ? String(app.student_id).slice(0,8) : 'N/A'}
                        </div>
                      </td>
                      <td className="p-5 text-sm text-slate-600 dark:text-slate-400 font-medium">{app.faculty || app.department || 'Not Specified'}</td>
                      <td className="p-5 text-sm text-slate-600 dark:text-slate-400 font-medium">{app.title || app.internship_title}</td>
                      <td className="p-5 text-xs text-slate-500 font-bold whitespace-nowrap">
                         {app.applied_date ? new Date(app.applied_date).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="p-5 text-center">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          ['approved', 'accepted'].includes((app.status || '').toLowerCase()) ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          (app.status || '').toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {app.status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <button 
                          onClick={() => handleViewDetails(app)}
                          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
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

      {/* Detail Modal */}
      {isModalOpen && (
         <ApplicantDetailModal 
            applicant={selectedApplicant}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAction={handleAction}
         />
      )}
    </div>
  );
};

export default OrgApplications;
