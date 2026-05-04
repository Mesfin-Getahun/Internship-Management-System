import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faChevronRight,
  faFileAlt,
  faSpinner,
  faStar,
  faTimes,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

const EvaluationModal = ({ evaluation, onClose }) => {
  if (!evaluation) return null;

  const numericRating = Number(evaluation.rating || 0);

  const renderStars = (score) => (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <FontAwesomeIcon
          icon={faStar}
          key={index}
          size="sm"
          className={index < score ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl m-4 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FontAwesomeIcon icon={faBuilding} size="sm" />
            </div>
            Company Mentor Feedback
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Student</p>
              <p className="font-bold text-slate-800 dark:text-white">{evaluation.student_name || 'Unknown Student'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Company</p>
              <p className="font-bold text-slate-800 dark:text-white">{evaluation.company_name || 'Host Organization'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Supervisor</p>
              <p className="font-bold text-slate-800 dark:text-white">{evaluation.company_mentor_name || 'Company Mentor'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Feedback Type</p>
              <p className="font-bold text-slate-800 dark:text-white">{evaluation.feedback_type || 'Company Review'}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Overall Score</p>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
              {renderStars(numericRating)}
              <span className="font-bold text-slate-700 dark:text-slate-300">({numericRating.toFixed(1)} / 5.0)</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Supervisor Comments</p>
            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{evaluation.overall_comment || 'No comments provided.'}"
              </p>
            </div>
          </div>

          {[
            ['Strengths', evaluation.strengths],
            ['Weaknesses', evaluation.weaknesses],
            ['Suggestions', evaluation.suggestions],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">{label}</p>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {value || `No ${label.toLowerCase()} recorded.`}
                </p>
              </div>
            </div>
          ))}

          <div className="text-right font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest text-lg pt-6 border-t border-slate-100 dark:border-slate-800">
            Final Equivalent Grade: {(numericRating * 8).toFixed(2)} / 40.00
          </div>
        </div>
      </div>
    </div>
  );
};


const OrganizationUpdates = () => {
  const { user } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoadingId, setDetailLoadingId] = useState(null);

  useEffect(() => {
    const fetchCompanyFeedback = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mentor/companyFeedback`, {
           headers: { Authorization: `Bearer ${user?.token}` }
        });
        const data = res.data.feedbacks || res.data.feedback || res.data || [];
        setFeedbacks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load company feedback.", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchCompanyFeedback();
    else setLoading(false);
  }, [user?.token]);

  const students = useMemo(
    () =>
      Array.from(
        new Map(
          feedbacks
            .filter((feedback) => feedback.student_id)
            .map((feedback) => [
              String(feedback.student_id),
              {
                id: String(feedback.student_id),
                name: feedback.student_name || 'Student',
              },
            ])
        ).values()
      ),
    [feedbacks]
  );

  useEffect(() => {
    if (!selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].id);
    }
  }, [selectedStudentId, students]);

  const currentEvaluations = useMemo(() => {
    if (!selectedStudentId) {
      return feedbacks;
    }

    return feedbacks.filter(
      (feedback) => String(feedback.student_id || '') === String(selectedStudentId)
    );
  }, [feedbacks, selectedStudentId]);

  const handleOpenFeedback = async (feedback) => {
    if (!feedback?.feedback_id || !user?.token) {
      setSelectedEvaluation(feedback);
      return;
    }

    try {
      setDetailLoadingId(feedback.feedback_id);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/mentor/feedback/${encodeURIComponent(feedback.feedback_id)}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setSelectedEvaluation({ ...feedback, ...(res.data?.feedback || {}) });
    } catch (err) {
      console.error('Failed to load feedback detail.', err);
      setSelectedEvaluation(feedback);
    } finally {
      setDetailLoadingId(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Organization Updates</h2>
        <p className="text-slate-500 text-sm mt-1">Review academic performance metrics and feedback submitted by company supervisors.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8">
        <label htmlFor="student-select" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
          Select Supervised Student
        </label>
        <div className="relative max-w-md">
            <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size="sm" />
            <select
                id="student-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm appearance-none cursor-pointer shadow-sm disabled:opacity-50"
                disabled={loading}
            >
                <option value="">-- View Company Feedback --</option>
                {students.map(student => (
                   <option key={student.id} value={student.id}>{student.name}</option>
                ))}
            </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40 text-blue-500">
           <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      ) : currentEvaluations.length > 0 ? (
        <div className="space-y-6">
          {currentEvaluations.map((evaluation) => {
            const numericRating = Number(evaluation.rating || 0);

            return (
              <div
                key={evaluation.feedback_id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 animate-fade-in-up"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Company</p>
                    <p className="font-bold text-slate-800 dark:text-white">{evaluation.company_name || 'Company'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Supervisor</p>
                    <p className="font-bold text-slate-800 dark:text-white">{evaluation.company_mentor_name || 'Mentor'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Feedback Date</p>
                    <p className="font-bold text-slate-800 dark:text-white">
                      {evaluation.created_at ? new Date(evaluation.created_at).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Target Score</p>
                    <p className="font-black text-blue-600 dark:text-blue-400 text-lg">
                      {(numericRating * 8).toFixed(2)} / 40
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                  <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      Feedback Type
                    </p>
                    <p className="font-bold text-slate-800 dark:text-white">
                      {evaluation.feedback_type || 'Company Review'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      Rating
                    </p>
                    <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <FontAwesomeIcon icon={faStar} className="text-amber-400" />
                      {numericRating.toFixed(1)} / 5
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      Record ID
                    </p>
                    <p className="font-bold text-slate-800 dark:text-white">{evaluation.feedback_id}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Remarks</p>
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <p className="italic text-slate-600 dark:text-slate-300 leading-relaxed">
                      "{evaluation.overall_comment || 'No comments left.'}"
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleOpenFeedback(evaluation)}
                    className="font-bold text-[10px] uppercase tracking-widest text-blue-600 hover:text-white dark:text-blue-400 dark:hover:text-white flex items-center gap-2 px-6 py-3 rounded-xl hover:bg-blue-600 transition-all shadow-sm active:scale-95 border border-blue-100 dark:border-blue-900/50 hover:border-blue-600"
                  >
                    {detailLoadingId === evaluation.feedback_id ? (
                      <FontAwesomeIcon icon={faSpinner} spin size="lg" />
                    ) : (
                      <FontAwesomeIcon icon={faFileAlt} size="lg" />
                    )}
                    View Full Record
                    <FontAwesomeIcon icon={faChevronRight} size="sm" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm min-h-[250px] text-center">
            <FontAwesomeIcon icon={faBuilding} size="3x" className="text-slate-300 mb-4" />
            <p className="text-xl font-bold text-slate-700 dark:text-white">Awaiting Selection</p>
            <p className="text-sm text-slate-500 mt-2">Open the dropdown picker to view company mentor feedback for an assigned student.</p>
        </div>
      )}
      <EvaluationModal evaluation={selectedEvaluation} onClose={() => setSelectedEvaluation(null)} />
    </div>
  );
};

export default OrganizationUpdates;
