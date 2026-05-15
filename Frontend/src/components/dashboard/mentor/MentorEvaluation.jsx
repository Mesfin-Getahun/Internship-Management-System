import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight, faCommentDots, faHistory, faPaperPlane, faReply, faSearch, faSpinner, faStar } from '@fortawesome/free-solid-svg-icons';

const getFeedbackText = (feedback) =>
  feedback?.overall_comment || feedback?.comments || feedback?.feedback_text || feedback?.content || 'No feedback comment available.';

const FeedbackHistory = ({
  history = [],
  title = 'Student Feedback History',
  emptyText = 'No previous feedback history is available for this student.',
  tone = 'teal',
}) => {
  const toneClass = tone === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : 'text-teal-600 dark:text-teal-400';

  if (!history.length) {
    return (
      <div className="mt-5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 p-5 text-sm font-semibold text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faHistory} className={toneClass} />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${toneClass}`}>
          {history.length} item{history.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="space-y-3">
        {history.map((item) => {
          const isFaculty = item.source_role === 'faculty_mentor' || !item.company_mentor_id;
          const rating = Number(item.rating || 0);

          return (
            <div
              key={item.feedback_id}
              className={`rounded-2xl border p-4 ${
                isFaculty
                  ? 'border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/70 dark:bg-indigo-950/20'
                  : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-white">
                    {item.source_name || item.company_mentor_name || item.mentor_name || 'Mentor'}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                    {isFaculty ? 'Faculty Mentor' : 'Organization Mentor'} - {item.feedback_type || 'Feedback'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {rating > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-slate-600 dark:text-slate-300">
                      <FontAwesomeIcon icon={faStar} className="text-amber-400" />
                      {rating.toFixed(1)}
                    </span>
                  )}
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3">{getFeedbackText(item)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MentorEvaluation = () => {
  const [comments, setComments] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [companyFeedbacks, setCompanyFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStudentIds, setExpandedStudentIds] = useState([]);
  const [activeFeedbackId, setActiveFeedbackId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchMentorFeedback = useCallback(
    async (showSpinner = true) => {
      try {
        if (showSpinner) setLoading(true);
        const feedbackRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mentor/companyFeedback`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });

        setCompanyFeedbacks(feedbackRes.data?.feedbacks || feedbackRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load feedback.');
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [user?.token],
  );

  useEffect(() => {
    if (user?.token) fetchMentorFeedback();
    else setLoading(false);
  }, [fetchMentorFeedback, user?.token]);

  const studentFeedbackGroups = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const sortedFeedbacks = [...companyFeedbacks].sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
    );
    const groupsByStudent = new Map();

    sortedFeedbacks.forEach((feedback) => {
      const studentKey = String(feedback.student_id || feedback.student_email || feedback.student_name || feedback.feedback_id || '');
      if (!groupsByStudent.has(studentKey)) {
        groupsByStudent.set(studentKey, {
          studentKey,
          studentId: feedback.student_id,
          studentName: feedback.student_name || 'Student',
          studentEmail: feedback.student_email,
          latestFeedback: feedback,
          feedbacks: [],
        });
      }

      groupsByStudent.get(studentKey).feedbacks.push(feedback);
    });

    const groups = Array.from(groupsByStudent.values());
    if (!query) return groups;

    return groups.filter((group) => {
      const studentMatch = [group.studentName, group.studentId, group.studentEmail]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));

      if (studentMatch) return true;

      return group.feedbacks.some((feedback) =>
        [
          feedback.company_name,
          feedback.company_mentor_name,
          feedback.internship_title,
          feedback.feedback_type,
          getFeedbackText(feedback),
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query)),
      );
    });
  }, [companyFeedbacks, searchTerm]);

  const handleToggleStudent = (group) => {
    const studentKey = String(group.studentKey || '');

    setExpandedStudentIds((currentIds) => {
      const isExpanded = currentIds.includes(studentKey);
      if (isExpanded) {
        setActiveFeedbackId('');
        setComments('');
        setSuggestions('');
        return currentIds.filter((id) => id !== studentKey);
      }

      return [...currentIds, studentKey];
    });
  };

  const handleOpenReply = (feedback) => {
    const feedbackId = String(feedback.feedback_id || '');
    const isAlreadyOpen = feedbackId === String(activeFeedbackId);

    setActiveFeedbackId(isAlreadyOpen ? '' : feedbackId);
    setComments('');
    setSuggestions('');
  };

  const handleSubmit = async (e, feedback) => {
    e.preventDefault();

    if (!feedback?.feedback_id || !feedback?.student_id) {
      toast.warn('Please choose a valid feedback item.');
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
        `${import.meta.env.VITE_BACKEND_URL}/api/mentor/provideFeedback/${feedback.student_id}`,
        { comments: messageParts.join('\n\n'), company_feedback_id: feedback.feedback_id },
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );

      toast.success('Feedback sent to the student successfully.');
      setComments('');
      setSuggestions('');
      setActiveFeedbackId('');
      await fetchMentorFeedback(false);
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

          {studentFeedbackGroups.length === 0 ? (
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
            <div className="space-y-4">
              {studentFeedbackGroups.map((group) => {
                const isExpanded = expandedStudentIds.includes(String(group.studentKey));
                const latestFeedback = group.latestFeedback || {};
                const latestRating = Number(latestFeedback.rating || 0);

                return (
                  <article
                    key={group.studentKey}
                    className={`rounded-3xl border p-5 transition-all ${
                      isExpanded
                        ? 'border-teal-400 bg-teal-50/70 dark:bg-teal-900/20 shadow-sm'
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-slate-800 dark:text-white">
                            {group.studentName}
                          </p>
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-700">
                            {group.studentId || 'No ID'}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-300 border border-teal-100 dark:border-teal-900/50">
                            {group.feedbacks.length} feedback{group.feedbacks.length === 1 ? '' : 's'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Latest: {latestFeedback.company_name || 'Company'} - {latestFeedback.internship_title || 'Internship'}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                          {getFeedbackText(latestFeedback)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {latestFeedback.created_at ? new Date(latestFeedback.created_at).toLocaleDateString() : 'Recent'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200">
                          <FontAwesomeIcon icon={faStar} className="text-amber-400" />
                          {latestRating ? latestRating.toFixed(1) : 'N/A'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleStudent(group)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            isExpanded
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                              : 'bg-teal-600 text-white hover:bg-teal-700'
                          }`}
                        >
                          <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} className="mr-2" />
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-5 space-y-4">
                        {group.feedbacks.map((feedback) => {
                          const isActive = String(feedback.feedback_id) === String(activeFeedbackId);
                          const rating = Number(feedback.rating || 0);

                          return (
                            <div
                              key={feedback.feedback_id}
                              className={`rounded-2xl border p-5 ${
                                isActive
                                  ? 'border-teal-200 dark:border-teal-900/60 bg-white dark:bg-slate-900'
                                  : 'border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60'
                              }`}
                            >
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Organization Feedback
                                  </p>
                                  <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                                    {feedback.company_mentor_name || 'Organization Mentor'} - {feedback.company_name || 'Company'}
                                  </p>
                                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                                    {getFeedbackText(feedback)}
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 shrink-0">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {feedback.created_at ? new Date(feedback.created_at).toLocaleDateString() : 'Recent'}
                                  </span>
                                  <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200">
                                    <FontAwesomeIcon icon={faStar} className="text-amber-400" />
                                    {rating ? rating.toFixed(1) : 'N/A'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReply(feedback)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                      isActive
                                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                        : 'bg-teal-600 text-white hover:bg-teal-700'
                                    }`}
                                  >
                                    <FontAwesomeIcon icon={faReply} className="mr-2" />
                                    {isActive ? 'Close' : 'Give Suggestion / Comment'}
                                  </button>
                                </div>
                              </div>

                              <FeedbackHistory
                                history={feedback.faculty_replies || []}
                                title="Faculty Comments for This Feedback"
                                emptyText="No faculty comment has been added for this organization feedback yet."
                                tone="indigo"
                              />

                              {isActive && (
                                <form className="mt-5 rounded-2xl border border-teal-100 dark:border-teal-900/50 bg-slate-50 dark:bg-slate-800 p-5 space-y-5" onSubmit={(e) => handleSubmit(e, feedback)}>
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400">
                                      Give Suggestion / Comment
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                      Your response will be attached to this exact organization feedback.
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                      Feedback / Comment <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                      rows="5"
                                      value={comments}
                                      onChange={(e) => setComments(e.target.value)}
                                      placeholder="Write your feedback to the student..."
                                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none leading-relaxed transition-all font-medium"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                      Suggestion to Student
                                    </label>
                                    <textarea
                                      rows="3"
                                      value={suggestions}
                                      onChange={(e) => setSuggestions(e.target.value)}
                                      placeholder="Add a clear academic suggestion or next step for the student..."
                                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none leading-relaxed transition-all font-medium"
                                    />
                                  </div>

                                  <div className="flex justify-end pt-2">
                                    <button
                                      type="submit"
                                      disabled={submitting}
                                      className="px-6 py-3 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-3 border border-teal-500"
                                    >
                                      {submitting ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPaperPlane} className="text-teal-300" />}
                                      {submitting ? 'Sending...' : 'Send Feedback'}
                                    </button>
                                  </div>
                                </form>
                              )}
                            </div>
                          );
                        })}

                        <FeedbackHistory
                          history={latestFeedback.feedback_history || []}
                          title="All Feedback History for This Student"
                          emptyText="No previous feedback history is available for this student."
                        />
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MentorEvaluation;
