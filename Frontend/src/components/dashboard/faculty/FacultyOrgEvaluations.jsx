import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faStar, faBuilding, faUser, faFileAlt, faSpinner, faCommentSlash, faPaperclip } from '@fortawesome/free-solid-svg-icons';

const EvaluationModal = ({ evaluation, onClose }) => {
  if (!evaluation) return null;

  const isOrg = evaluation.type === 'Organization' || !evaluation.university_mentor_id;
  const rating = evaluation.rating || evaluation.score || (evaluation.total_mark ? Math.min(5, Math.round(evaluation.total_mark / 20)) : 5);

  const renderStars = (rating) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <FontAwesomeIcon icon={faStar} key={i} size="sm" className={i < rating ? 'text-amber-400 fill-current' : 'text-slate-200 dark:text-slate-600'} />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl m-4 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
               <FontAwesomeIcon icon={faFileAlt} size="sm" /> 
            </div>
            Evaluation Details
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-grow">
          <div className="flex justify-between items-start bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Student</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{evaluation.student_name || evaluation.student || 'Student Name'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Evaluation Target</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white flex items-center justify-end gap-2">
                {isOrg ? <FontAwesomeIcon icon={faBuilding} className="text-slate-400 text-sm" /> : <FontAwesomeIcon icon={faUser} className="text-slate-400 text-sm" />}
                {evaluation.target || evaluation.company_name || 'Organization'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-3">Overall Rating</p>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
               {renderStars(rating)}
               <span className="font-bold text-slate-700 dark:text-slate-300">({rating}.0 / 5.0)</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-3">Comments & Feedback</p>
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">"{evaluation.summary || evaluation.comments || evaluation.feedback_text || `Total mark: ${evaluation.total_mark || 'N/A'}`}"</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-3">Submitted Files</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href={evaluation.assessment_pdf_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  evaluation.assessment_pdf_url
                    ? 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    : 'border-slate-100 dark:border-slate-800 opacity-60 pointer-events-none'
                }`}
              >
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Assessment File</span>
                <FontAwesomeIcon icon={faPaperclip} className="text-indigo-500" />
              </a>
              <a
                href={evaluation.attendance_pdf_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  evaluation.attendance_pdf_url
                    ? 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    : 'border-slate-100 dark:border-slate-800 opacity-60 pointer-events-none'
                }`}
              >
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Attendance File</span>
                <FontAwesomeIcon icon={faPaperclip} className="text-indigo-500" />
              </a>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Evaluation submitted on {evaluation.date || evaluation.created_at ? new Date(evaluation.date || evaluation.created_at).toLocaleDateString() : 'N/A'}
        </div>
      </div>
    </div>
  );
};

const FacultyOrgEvaluations = () => {
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/companyEvaluation`, {
           headers: { Authorization: `Bearer ${user?.token}` }
        });
        const data = res.data.evaluations || res.data || [];
        setEvaluations(data);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
    };
    if (user?.token) fetchEvaluations();
  }, [user]);

  const filteredEvaluations = useMemo(() => {
    return evaluations
      .filter(e => {
         const type = e.university_mentor_id ? 'Mentor' : 'Organization';
         return filter === 'All' || type === filter;
      })
      .filter(e => {
        const sName = (e.student_name || e.student || '').toLowerCase();
        const tName = (e.company_name || e.target || '').toLowerCase();
        return sName.includes(searchTerm.toLowerCase()) || tName.includes(searchTerm.toLowerCase());
      });
  }, [filter, searchTerm, evaluations]);

  const renderStars = (rating) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <FontAwesomeIcon icon={faStar} key={i} size="xs" className={i < rating ? 'text-amber-400 fill-current' : 'text-slate-200 dark:text-slate-700'} />
      ))}
    </div>
  );

  const handleOpenEvaluation = async (evaluation) => {
    if (!user?.token || !evaluation?.evaluation_id) {
      setSelectedEvaluation(evaluation);
      return;
    }

    try {
      setDetailLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/faculty/companyEvaluation/${encodeURIComponent(evaluation.evaluation_id)}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSelectedEvaluation({ ...evaluation, ...(res.data?.evaluation || {}) });
    } catch (err) {
      console.error(err);
      setSelectedEvaluation(evaluation);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <EvaluationModal evaluation={selectedEvaluation} onClose={() => setSelectedEvaluation(null)} />
      
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Student Evaluations</h2>
        <p className="text-slate-500 text-sm mt-1">Review feedback ratings provided by host organizations.</p>
      </header>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {['All', 'Organization', 'Mentor'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                filter === f 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size="sm" />
          <input 
            type="text" 
            placeholder="Search matching evaluations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {loading ? (
         <div className="flex justify-center items-center h-64 text-indigo-500">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
         </div>
      ) : filteredEvaluations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvaluations.map((e, idx) => {
             const type = e.university_mentor_id ? 'Mentor' : 'Organization';
             const isOrg = type === 'Organization';
             const rating = e.rating || e.score || (e.total_mark ? Math.min(5, Math.round(e.total_mark / 20)) : 5);
             return (
               <div key={e.evaluation_id || e.id || idx} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 group">
                 <div className="flex justify-between items-start mb-6">
                   <div>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{e.student_name || e.student || 'Student Name'}</p>
                     <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                       {isOrg ? <FontAwesomeIcon icon={faBuilding} size="sm" className="text-slate-400" /> : <FontAwesomeIcon icon={faUser} size="sm" className="text-slate-400" />}
                       {e.company_name || e.target || 'Organization'}
                     </p>
                   </div>
                   <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${isOrg ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                     {type}
                   </div>
                 </div>
                 <p className="text-sm text-slate-600 dark:text-slate-400 italic line-clamp-3 mb-6 flex-grow">"{e.summary || e.comments || e.feedback_text || `Total mark: ${e.total_mark || 'N/A'}`}"</p>
                 <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
                   <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                     {renderStars(rating)}
                     <span className="text-[10px] font-black text-slate-500">({rating}.0)</span>
                   </div>
                   <button 
                     onClick={() => handleOpenEvaluation(e)}
                     className="bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 text-slate-600 dark:text-slate-300 hover:text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-lg transition-all active:scale-95"
                   >
                     {detailLoading && selectedEvaluation?.evaluation_id === e.evaluation_id ? 'Loading...' : 'Details'}
                   </button>
                 </div>
               </div>
             )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm min-h-[300px]">
          <FontAwesomeIcon icon={faCommentSlash} size="3x" className="text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-white">No Evaluations Found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">No evaluation criteria matches the current filters.</p>
        </div>
      )}
    </div>
  );
};

export default FacultyOrgEvaluations;
