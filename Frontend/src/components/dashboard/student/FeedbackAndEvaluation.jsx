import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBuilding, faStar, faSpinner, faCommentSlash, faReply, faPaperclip } from '@fortawesome/free-solid-svg-icons';

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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/viewFeedbacks`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        
        if (res.data.feedbacks) {
           setFeedbacks(res.data.feedbacks);
        } else if (Array.isArray(res.data)) {
           setFeedbacks(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchFeedback();
  }, [user]);

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
