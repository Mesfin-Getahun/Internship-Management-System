import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const MentorEvaluation = () => {
  const [rating, setRating] = useState({ conduct: 0, technical: 0, communication: 0, solving: 0 });
  const [comments, setComments] = useState('');
  const [students, setStudents] = useState([]);
  const [companyFeedbacks, setCompanyFeedbacks] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        setLoading(true);
        const [studentsRes, feedbackRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mentor/students`, {
            headers: { Authorization: `Bearer ${user?.token}` }
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mentor/companyFeedback`, {
            headers: { Authorization: `Bearer ${user?.token}` }
          }),
        ]);
        setStudents(studentsRes.data?.students || studentsRes.data || []);
        setCompanyFeedbacks(feedbackRes.data?.feedbacks || feedbackRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchMentorData();
    else setLoading(false);
  }, [user?.token]);

  const setCriteriaRating = (key, val) => {
    setRating(prev => ({ ...prev, [key]: val }));
  };

  const calculateTotal = () => Object.values(rating).reduce((a, b) => a + b, 0);

  const latestCompanyFeedback = useMemo(() => {
    if (!selectedStudentId) return null;

    const studentFeedbacks = companyFeedbacks
      .filter((feedback) => String(feedback.student_id || '') === String(selectedStudentId))
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return studentFeedbacks[0] || null;
  }, [companyFeedbacks, selectedStudentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
       toast.warn("Please select a valid candidate.");
       return;
    }
    if (calculateTotal() === 0) {
       toast.warn("Please rate at least one criterion before submitting.");
       return;
    }

    try {
       setSubmitting(true);
       
       const totalRating = Number((calculateTotal() / 4).toFixed(2));
       const synthesizedComments = [
         'Faculty mentor review',
         `Overall mentor score: ${calculateTotal()}/20`,
         `Breakdown: conduct ${rating.conduct}/5, technical ${rating.technical}/5, communication ${rating.communication}/5, problem solving ${rating.solving}/5.`,
         comments?.trim() ? `Comments: ${comments.trim()}` : 'Comments: No additional remarks.',
       ].join('\n');

       await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/mentor/provideFeedback/${selectedStudentId}`, 
          {
            comments: synthesizedComments,
            rating: totalRating,
          },
          { headers: { Authorization: `Bearer ${user?.token}` } }
       );
       
       toast.success("Academic assessment registered successfully!");
       
       // Reset form
       setComments('');
       setRating({ conduct: 0, technical: 0, communication: 0, solving: 0 });
       setSelectedStudentId('');
    } catch (err) {
       console.error(err);
       toast.error("An error occurred while transmitting the final assessment.");
    } finally {
       setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto pb-12">
      <ToastContainer theme="colored" position="top-right" autoClose={3000} hideProgressBar />
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Submit Academic Evaluation</h2>
        <p className="text-slate-500 text-sm mt-1 font-medium">Evaluate the student's technical and professional progress for faculty credits.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden">
        {loading && (
           <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-teal-500" />
           </div>
        )}
        <form className="space-y-10" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <div>
              <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Select Target Candidate <span className="text-rose-500">*</span></label>
              <select 
                 value={selectedStudentId}
                 onChange={(e) => setSelectedStudentId(e.target.value)}
                 required
                 className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-sm appearance-none shadow-sm cursor-pointer"
              >
                <option value="">-- Faculty Assignment Roster --</option>
                {students.map(s => (
                   <option key={s.student_id || s.id} value={s.student_id || s.id}>{s.student_name || s.full_name || s.name || 'Student'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Academic Phase</label>
              <input type="text" value="Final Grade Registration" readOnly className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-500 font-bold focus:outline-none cursor-not-allowed shadow-inner" />
            </div>
          </div>

          {latestCompanyFeedback && (
            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl">
              <p className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-2">
                Latest Company Mentor Feedback
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {latestCompanyFeedback.company_mentor_name || 'Company Mentor'} - {latestCompanyFeedback.company_name || 'Company'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                {latestCompanyFeedback.overall_comment || 'No company mentor comment available.'}
              </p>
            </div>
          )}

          <div className="space-y-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Scoring Rubric</h4>
            
            {[
              { id: 'conduct', label: 'Professional Conduct & Ethics' },
              { id: 'technical', label: 'Technical Proficiency & Skill Application' },
              { id: 'communication', label: 'Communication & Collaboration' },
              { id: 'solving', label: 'Critical Logic & Problem Solving' }
            ].map(criteria => (
              <div key={criteria.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800/50">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{criteria.label}</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCriteriaRating(criteria.id, star)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all ${
                        rating[criteria.id] >= star 
                           ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/30 rotate-3 scale-105' 
                           : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800/50 rounded-2xl flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-teal-600 text-white rounded-xl flex items-center justify-center font-black text-2xl shadow-lg shadow-teal-600/20">∑</div>
               <div>
                  <p className="text-[10px] font-black text-teal-800 dark:text-teal-400 uppercase tracking-widest">Cumulative Faculty Marker</p>
                  <p className="text-xs text-teal-600 dark:text-teal-500 font-bold mt-1">Weighting is locked by academic rules.</p>
               </div>
             </div>
             <div className="text-5xl font-black text-teal-600 tracking-tighter">
               {calculateTotal()} <span className="text-lg font-bold text-slate-400">/ 20</span>
             </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest">Qualitative Remarks & Directives (Optional)</label>
            <textarea 
               rows="5" 
               value={comments}
               onChange={(e) => setComments(e.target.value)}
               placeholder="Enter academic feedback for the official faculty records..." 
               className="w-full px-5 py-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none leading-relaxed transition-all font-medium"
            ></textarea>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
             <button 
                type="submit" 
                disabled={submitting}
                className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-3 border border-teal-500"
             >
                {submitting ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheckCircle} className="text-teal-300" />}
                {submitting ? 'Transmitting...' : 'Register Final Appraisal'}
             </button>
          </div>
        </form>
      </div>
      
      <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-2xl text-center">
        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-black uppercase tracking-widest px-4">
          Academic Integrity Notice: This evaluation matrix is confidential and transmitted immediately to the department registrar. It represents the final determining vector for course crediting.
        </p>
      </div>
    </div>
  );
};

export default MentorEvaluation;
