import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faEdit, faTrashAlt, faChevronDown, faChevronUp, faMapMarkerAlt, faSpinner, faBuilding, faLock } from '@fortawesome/free-solid-svg-icons';

const OrgVacancies = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const { user } = useAuth();

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company/activeInternships`, {
         headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.data.internships) {
         setInternships(res.data.internships);
      } else if (Array.isArray(res.data)) {
         setInternships(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch active internships:", err);
      toast.error("Failed to load active internships");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchInternships();
  }, [user]);

  const handleToggleDetails = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (e, id, title) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the vacancy "${title}"?`)) {
      try {
         await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/company/deleteInternship/${id}`, {
            headers: { Authorization: `Bearer ${user?.token}` }
         });
         toast.success(`Vacancy "${title}" has been deleted.`);
         fetchInternships(); // refresh the list
      } catch (err) {
         console.error(err);
         toast.error(err.response?.data?.message || "Failed to delete the vacancy.");
      }
    }
  };
  
  const handleEdit = (e, id) => {
    e.stopPropagation();
    navigate(`/organization/post-internship?edit=${id}`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Internship Vacancies</h2>
          <p className="text-slate-500 text-sm mt-1">Review, edit, or remove your organization's internship opportunities.</p>
        </div>
        <Link
          to="/organization/post-internship"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 text-sm"
        >
          <FontAwesomeIcon icon={faPlusCircle} size="lg" />
          Post New Vacancy
        </Link>
      </header>

      {loading ? (
         <div className="flex justify-center items-center h-64 text-blue-500">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
         </div>
      ) : internships.length === 0 ? (
         <div className="flex flex-col justify-center items-center h-64 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8">
            <FontAwesomeIcon icon={faBuilding} size="3x" className="text-slate-300 mb-4" />
            <p className="font-bold text-xl text-slate-700 dark:text-white">No active vacancies posted.</p>
            <p className="text-slate-500 mt-2 text-sm text-center">Click "Post New Vacancy" to distribute opportunities to university students.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {internships.map(internship => {
            const internshipId = internship.internship_id || internship.id;
            const isLocked = internship.is_locked || internship.can_edit === false || internship.can_delete === false;
            const lockLabel = Number(internship.locked_students || 0) > 0 ? 'Accepted' : 'Applied';

            return (
            <div 
              key={internshipId}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 flex flex-col group overflow-hidden"
            >
              <div className="p-6 cursor-pointer flex-grow" onClick={() => handleToggleDetails(internshipId)}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors leading-tight pr-4">
                       {internship.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{internship.status || 'Active'}</p>
                      {isLocked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800">
                          <FontAwesomeIcon icon={faLock} />
                          {lockLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                     <button
                       title={isLocked ? "Internships with applications cannot be edited" : "Edit"}
                       disabled={isLocked}
                       onClick={(e) => handleEdit(e, internshipId)}
                       className="w-8 h-8 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-50 dark:disabled:hover:bg-blue-900/20"
                     >
                       <FontAwesomeIcon icon={faEdit} size="sm" />
                     </button>
                     <button
                       title={isLocked ? "Internships with applications cannot be deleted" : "Delete"}
                       disabled={isLocked}
                       onClick={(e) => handleDelete(e, internshipId, internship.title)}
                       className="w-8 h-8 flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-50 dark:disabled:hover:bg-red-900/20"
                     >
                       <FontAwesomeIcon icon={faTrashAlt} size="sm" />
                     </button>
                  </div>
                </div>
                
                <div className="mt-8 flex flex-col gap-3 text-sm">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-slate-400" />
                    <span>{internship.location || 'Not Specified'}</span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 cursor-pointer flex justify-between items-center" onClick={() => handleToggleDetails(internshipId)}>
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {expandedId === internshipId ? 'Collapse Details' : 'View Requirements'}
                 </span>
                 <FontAwesomeIcon icon={expandedId === internshipId ? faChevronUp : faChevronDown} className="text-slate-400" />
              </div>

              {expandedId === internshipId && (
                <div className="px-6 py-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 animate-fade-in-fast">
                  <div className="space-y-4">
                     {isLocked && (
                        <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                          This vacancy is locked because a student has applied or been accepted. Its details are kept for internship records.
                        </p>
                     )}
                     <div>
                       <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Description</h4>
                       <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                         {internship.description || 'No description provided.'}
                       </p>
                     </div>
                     {internship.requirements && (
                        <div>
                          <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Requirements</h4>
                          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {internship.requirements}
                          </p>
                        </div>
                     )}
                     <div>
                       <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Target Department</h4>
                       <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                         {internship.department || 'General / skill-based'}
                       </p>
                     </div>
                     <div>
                       <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                          Deadline: {internship.end_date ? new Date(internship.end_date).toLocaleDateString() : 'N/A'}
                       </span>
                     </div>
                  </div>
                </div>
              )}
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
};

export default OrgVacancies;
