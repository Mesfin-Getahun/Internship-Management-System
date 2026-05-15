import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCommentDots, faPaperPlane, faSearch, faSpinner, faStar } from '@fortawesome/free-solid-svg-icons';

const MentorEvaluation = () => {
  const [comments, setComments] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [students, setStudents] = useState([]);
  const [companyFeedbacks, setCompanyFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyFeedbackId, setSelectedCompanyFeedbackId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        setLoading(true);
        const [studentsRes, feedbackRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mentor/students`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mentor/companyFeedback`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
        ]);

        setStudents(studentsRes.data?.students || studentsRes.data || []);
        setCompanyFeedbacks(feedbackRes.data?.feedbacks || feedbackRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load feedback.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchMentorData();
    else setLoading(false);
  }, [user?.token]);

  const selectedCompanyFeedback = useMemo(
    () => companyFeedbacks.find((feedback) => String(feedback.feedback_id) === String(selectedCompanyFeedbackId)) || null,
    [companyFeedbacks, selectedCompanyFeedbackId],
  );

  const selectedStudent = useMemo(() => {
    if (!selectedCompanyFeedback) return null;
    return (
      students.find((student) => String(student.student_id || student.id || '') === String(selectedCompanyFeedback.student_id || '')) ||
      selectedCompanyFeedback
    );
  }, [selectedCompanyFeedback, students]);

  const filteredFeedbacks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const sortedFeedbacks = [...companyFeedbacks].sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
    );

    if (!query) return sortedFeedbacks;

    return sortedFeedbacks.filter((feedback) =>
      [
        feedback.student_name,
        feedback.student_id,
        feedback.student_email,
        feedback.company_name,
        feedback.company_mentor_name,
        feedback.internship_title,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [companyFeedbacks, searchTerm]);

  const handleSelectFeedback = (feedback) => {
    setSelectedCompanyFeedbackId(String(feedback.feedback_id || ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCompanyFeedback) {
      toast.warn('Please select feedback before sending your response.');
      return;
    }

    if (!comments.trim() && !suggestions.trim()) {
      toast.warn('Please write feedback, a comment, or a suggestion before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const messageParts = [];
      if (comments.trim()) messageParts.push(comments.trim());
      if (suggestions.trim()) messageParts.push(`Suggestion: ${suggestions.trim()}`);

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/mentor/provideFeedback/${selectedCompanyFeedback.student_id}`,
        { comments: messageParts.join('\n\n'), company_feedback_id: selectedCompanyFeedback.feedback_id },
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );

      toast.success('Feedback sent to the student successfully.');
      setComments('');
      setSuggestions('');
      setSelectedCompanyFeedbackId('');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'An error occurred while sending feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl mx-auto pb-12">
      <ToastContainer theme="colored" position="top-right" autoClose={3000} hideProgressBar />
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Feedback</h2>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Review organization mentor feedback and send academic comments or suggestions to the student.
        </p>
      </header>

      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Organization Feedback</p>
            <h3 className="text-lg font-black text-slate-800 dark:text-white mt-1">All Feedback</h3>
          </div>
          <div className="relative w-full md:max-w-sm">
            <label htmlFor="student-feedback-search" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Search Student
            </label>
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 bottom-3.5 text-slate-400" size="sm" />
            <input
              id="student-feedback-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, ID, email, company..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-sm"
            />
          </div>
        </div>

        <div className="mt-6 relative min-h-[180px]">
          {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-teal-500" />
            </div>
          )}

          {filteredFeedbacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[180px] text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-8">
              <FontAwesomeIcon icon={faCommentDots} className="text-slate-300 dark:text-slate-600 text-3xl mb-3" />
              <p className="text-lg font-bold text-slate-700 dark:text-white">
                {searchTerm.trim() ? 'No feedback matches that student search.' : 'No organization feedback is available yet.'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {searchTerm.trim() ? 'Try a student name, ID, email, or company name.' : 'Feedback will appear here after organization mentors submit it.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFeedbacks.map((feedback) => {
                const isSelected = String(feedback.feedback_id) === String(selectedCompanyFeedbackId);
                const rating = Number(feedback.rating || 0);

                return (
                  <button
                    key={feedback.feedback_id}
                    type="button"
                    onClick={() => handleSelectFeedback(feedback)}
                    className={`w-full text-left rounded-2xl border p-5 transition-all ${
                      isSelected
                        ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/20 shadow-sm'
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-teal-200 dark:hover:border-teal-700'
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-slate-800 dark:text-white">
                            {feedback.student_name || 'Student'}
                          </p>
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-700">
                            {feedback.student_id || 'No ID'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {feedback.company_name || 'Company'} - {feedback.internship_title || 'Internship'}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 line-clamp-2">
                          {feedback.overall_comment || feedback.feedback_text || 'No organization mentor comment available.'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {feedback.created_at ? new Date(feedback.created_at).toLocaleDateString() : 'Recent'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200">
                          <FontAwesomeIcon icon={faStar} className="text-amber-400" />
                          {rating ? rating.toFixed(1) : 'N/A'}
                        </span>
                        <span className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          isSelected
                            ? 'bg-teal-600 text-white'
                            : 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-900/50'
                        }`}>
                          {isSelected ? 'Selected' : 'Respond'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
        <form className="space-y-8" onSubmit={handleSubmit}>
          {selectedCompanyFeedback ? (
            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl">
              <p className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-2">
                Selected Feedback
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {selectedStudent?.student_name || selectedStudent?.full_name || selectedStudent?.name || 'Student'} - {selectedCompanyFeedback.company_name || 'Company'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                From {selectedCompanyFeedback.company_mentor_name || 'Organization Mentor'} on{' '}
                {selectedCompanyFeedback.created_at ? new Date(selectedCompanyFeedback.created_at).toLocaleDateString() : 'recent feedback'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
                {selectedCompanyFeedback.overall_comment || selectedCompanyFeedback.feedback_text || 'No organization mentor comment available.'}
              </p>
            </div>
          ) : (
            <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-2xl">
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                Select one organization feedback item above before sending your response.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Feedback / Comment <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="6"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Write your feedback to the student..."
              className="w-full px-5 py-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none leading-relaxed transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Suggestion to Student
            </label>
            <textarea
              rows="4"
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              placeholder="Add a clear academic suggestion or next step for the student..."
              className="w-full px-5 py-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none leading-relaxed transition-all font-medium"
            />
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={submitting || !selectedCompanyFeedback}
              className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-3 border border-teal-500"
            >
              {submitting ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={selectedCompanyFeedback ? faPaperPlane : faCheckCircle} className="text-teal-300" />}
              {submitting ? 'Sending...' : 'Send Feedback'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default MentorEvaluation;
