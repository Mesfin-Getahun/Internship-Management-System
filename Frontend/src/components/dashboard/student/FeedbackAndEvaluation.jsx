import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBuilding, faStar, faSpinner, faCommentSlash, faReply, faPaperclip, faPaperPlane, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const FeedbackCard = ({ author, role, date, content, rating, strengths, weaknesses, suggestions, attachmentUrl, attachmentName, children }) => (
  <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 mb-6 shadow-sm transition-all hover:shadow-lg group">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-slate-700 flex items-center justify-center mr-4 border border-indigo-100">
          {role?.toLowerCase().includes('faculty') ? (
            <FontAwesomeIcon icon={faUser} className="w-6 h-6 text-indigo-500" />
          ) : (
            <FontAwesomeIcon icon={faBuilding} className="w-6 h-6 text-indigo-500" />
          )}
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white text-lg">{author || 'Supervisor'}</h4>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mt-1">{role || 'Mentor Evaluation'}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{date ? new Date(date).toLocaleDateString() : 'Recent'}</p>
        {rating && (
          <div className="flex items-center justify-end mt-2 gap-1">
            {[...Array(5)].map((_, i) => (
              <FontAwesomeIcon icon={faStar}
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">{content}</p>
    {(strengths || weaknesses || suggestions) && (
      <div className="grid gap-3 mt-6 md:grid-cols-3">
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Strengths</div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{strengths || 'Not provided'}</p>
        </div>
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Weaknesses</div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{weaknesses || 'Not provided'}</p>
        </div>
        <div className="rounded-2xl bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900 p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">Suggestions</div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{suggestions || 'Not provided'}</p>
        </div>
      </div>
    )}
    {attachmentUrl && (
      <a
        href={attachmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-indigo-700 transition-all hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-300"
      >
        <FontAwesomeIcon icon={faPaperclip} />
        {attachmentName || 'Open Attachment'}
      </a>
    )}
    {children}
  </div>
);

const FacultyReply = ({ feedback }) => (
  <div className="mt-6 border-l-4 border-indigo-200 dark:border-indigo-800 pl-5">
    <div className="rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center">
            <FontAwesomeIcon icon={faReply} className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-white text-sm">
              {feedback.source_name || feedback.mentor_name || 'Faculty Mentor'}
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Faculty Mentor Response</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">
          {feedback.created_at ? new Date(feedback.created_at).toLocaleDateString() : 'Recent'}
        </p>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
        {feedback.overall_comment || feedback.comments || feedback.feedback_text || feedback.content || 'No feedback comment provided.'}
      </p>
    </div>
  </div>
);

const FeedbackAndEvaluation = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [ratingOptions, setRatingOptions] = useState([]);
  const [ratingForms, setRatingForms] = useState({});
  const [ratingSubmitting, setRatingSubmitting] = useState('');
  const [ratingMessage, setRatingMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const [feedbackRes, ratingRes, evaluationsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/viewFeedbacks`, {
            headers: { Authorization: `Bearer ${user?.token}` }
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/company-ratings`, {
            headers: { Authorization: `Bearer ${user?.token}` }
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/evaluations`, {
            headers: { Authorization: `Bearer ${user?.token}` }
          }),
        ]);
        
        if (feedbackRes.data.feedbacks) {
           setFeedbacks(feedbackRes.data.feedbacks);
        } else if (Array.isArray(feedbackRes.data)) {
           setFeedbacks(feedbackRes.data);
        }

        const placements = Array.isArray(ratingRes.data?.placements) ? ratingRes.data.placements : [];
        setEvaluations(Array.isArray(evaluationsRes.data?.evaluations) ? evaluationsRes.data.evaluations : []);
        setRatingOptions(placements);
        setRatingForms(Object.fromEntries(
          placements.map((placement) => {
            const key = `${placement.company_id}_${placement.internship_id}`;
            return [key, {
              rating: placement.rating || 5,
              comment: placement.comment || '',
            }];
          })
        ));
      } catch (err) {
        console.error("Failed to fetch feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchFeedback();
  }, [user]);

  const handleRatingChange = (key, field, value) => {
    setRatingForms((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value,
      },
    }));
  };

  const submitCompanyRating = async (placement) => {
    const key = `${placement.company_id}_${placement.internship_id}`;
    const form = ratingForms[key] || {};

    try {
      setRatingSubmitting(key);
      setRatingMessage('');
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/student/company-ratings`, {
        internship_id: placement.internship_id,
        company_id: placement.company_id,
        rating: Number(form.rating || 5),
        comment: form.comment || '',
      }, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      setRatingOptions((prev) => prev.map((item) => (
        item.company_id === placement.company_id && item.internship_id === placement.internship_id
          ? { ...item, rating: Number(form.rating || 5), comment: form.comment || '', rating_id: item.rating_id || true }
          : item
      )));
      setRatingMessage('Company rating saved successfully.');
    } catch (err) {
      console.error('Failed to submit company rating:', err);
      setRatingMessage(err.response?.data?.message || 'Failed to save company rating.');
    } finally {
      setRatingSubmitting('');
    }
  };

  const threadedFeedbacks = useMemo(() => {
    const companyMentor = feedbacks
      .filter((feedback) => feedback.source_role === 'company_mentor')
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const facultyMentor = feedbacks
      .filter((feedback) => feedback.source_role !== 'company_mentor')
      .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    const repliesByParent = new Map();
    const attachedFacultyIds = new Set();

    facultyMentor.forEach((feedback) => {
      if (!feedback.parent_feedback_id) return;
      const parentKey = String(feedback.parent_feedback_id);
      repliesByParent.set(parentKey, [...(repliesByParent.get(parentKey) || []), feedback]);
      attachedFacultyIds.add(feedback.feedback_id);
    });

    return {
      companyMentor,
      repliesByParent,
      orphanFaculty: facultyMentor.filter((feedback) => !attachedFacultyIds.has(feedback.feedback_id)),
    };
  }, [feedbacks]);

  const renderCompanyFeedbackList = () => {
    if (threadedFeedbacks.companyMentor.length === 0) {
      return (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/40 p-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">No company mentor feedback has been submitted yet.</p>
        </div>
      );
    }

    return threadedFeedbacks.companyMentor.map((fb, index) => {
      const facultyReplies = threadedFeedbacks.repliesByParent.get(String(fb.feedback_id)) || [];

      return (
        <FeedbackCard
          key={`${fb.feedback_id || index}-${fb.source_role}`}
          author={fb.source_name || fb.company_mentor_name || 'Company Mentor'}
          role="Company Mentor Feedback"
          date={fb.created_at || fb.date}
          content={fb.overall_comment || fb.comments || fb.feedback_text || fb.content || 'No feedback comment provided.'}
          rating={fb.rating || fb.score}
          strengths={fb.strengths}
          weaknesses={fb.weaknesses}
          suggestions={fb.suggestions}
          attachmentUrl={fb.attachment_url}
          attachmentName={fb.attachment_name}
        >
          {facultyReplies.map((reply) => (
            <FacultyReply key={reply.feedback_id || `${fb.feedback_id}-faculty`} feedback={reply} />
          ))}
        </FeedbackCard>
      );
    });
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Feedback & Evaluations</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Review official academic and performance feedback from your assigned supervisors.
        </p>
      </header>

      {ratingOptions.length > 0 && (
        <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Rate Host Company</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Share your completed internship experience with UIL.
            </p>
          </div>
          {ratingMessage && (
            <div className="mb-4 rounded-xl bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              {ratingMessage}
            </div>
          )}
          <div className="space-y-4">
            {ratingOptions.map((placement) => {
              const key = `${placement.company_id}_${placement.internship_id}`;
              const form = ratingForms[key] || {};
              const alreadyRated = Boolean(placement.rating_id || placement.rating);

              return (
                <div key={key} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">{placement.company_name || 'Host Company'}</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
                        {placement.internship_title || 'Completed Internship'}
                      </p>
                    </div>
                    {alreadyRated && (
                      <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Rated
                      </span>
                    )}
                  </div>
                  <div className="mt-5 grid gap-4 lg:grid-cols-[180px_1fr_auto] lg:items-end">
                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Rating</span>
                      <select
                        value={form.rating || 5}
                        onChange={(event) => handleRatingChange(key, 'rating', event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        {[5, 4, 3, 2, 1].map((value) => (
                          <option key={value} value={value}>{value} Star{value === 1 ? '' : 's'}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Comment</span>
                      <textarea
                        value={form.comment || ''}
                        onChange={(event) => handleRatingChange(key, 'comment', event.target.value)}
                        rows={3}
                        className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        placeholder="Write your experience with this company..."
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => submitCompanyRating(placement)}
                      disabled={ratingSubmitting === key}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-700 disabled:opacity-60"
                    >
                      <FontAwesomeIcon icon={ratingSubmitting === key ? faSpinner : faPaperPlane} spin={ratingSubmitting === key} />
                      Save
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {evaluations.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Internship Grade</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Current recorded marks toward your internship grade.
            </p>
          </div>
          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <div key={evaluation.evaluation_id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="mb-4">
                  <p className="font-bold text-slate-800 dark:text-white">{evaluation.internship_title || 'Internship'}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{evaluation.company_name || 'Host organization'}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    ['Company', evaluation.total_mark, 40],
                    ['Attendance', evaluation.faculty_attendance_mark, 10],
                    ['Report', evaluation.mentor_report_mark, 20],
                    ['Presentation', evaluation.final_presentation_mark, 30],
                    ['Known Total', evaluation.known_total_mark, 100],
                  ].map(([label, value, max]) => (
                    <div key={label} className="rounded-xl bg-white p-4 dark:bg-slate-900">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                      <p className="mt-2 text-xl font-black text-slate-800 dark:text-white">
                        {value ?? '-'}<span className="text-xs text-slate-400"> / {max}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {loading ? (
         <div className="flex justify-center items-center h-64 text-indigo-500">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
         </div>
      ) : feedbacks.length > 0 ? (
        <div className="space-y-6">
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Company Mentor Feedback</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Performance observations and workplace feedback from your organization supervisor.
              </p>
            </div>
            {renderCompanyFeedbackList()}
            {threadedFeedbacks.orphanFaculty.length > 0 && (
              <div className="rounded-3xl border border-dashed border-indigo-200 dark:border-indigo-900 bg-white/70 dark:bg-slate-800/40 p-5">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-3">
                  Faculty feedback not linked to a company feedback item
                </p>
                {threadedFeedbacks.orphanFaculty.map((feedback) => (
                  <FacultyReply key={feedback.feedback_id} feedback={feedback} />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center p-12 h-64 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <FontAwesomeIcon icon={faCommentSlash} size="3x" className="text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-white">No Feedback Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-md text-center">
            Evaluations and performance reviews will appear here once submitted by your university or company supervisors.
          </p>
        </div>
      )}
    </div>
  );
};

export default FeedbackAndEvaluation;
