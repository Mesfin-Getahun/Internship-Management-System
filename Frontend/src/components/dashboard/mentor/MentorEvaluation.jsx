import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

const MentorEvaluation = () => {
  const [comments, setComments] = useState('');
  const [students, setStudents] = useState([]);
  const [companyFeedbacks, setCompanyFeedbacks] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
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
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchMentorData();
    else setLoading(false);
  }, [user?.token]);

  const selectedStudent = useMemo(
    () => students.find((student) => String(student.student_id || student.id || '') === String(selectedStudentId)),
    [students, selectedStudentId],
  );

  const selectedCompanyFeedbacks = useMemo(() => {
    if (!selectedStudentId) return [];

    return companyFeedbacks
      .filter((feedback) => String(feedback.student_id || '') === String(selectedStudentId))
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [companyFeedbacks, selectedStudentId]);

  const latestCompanyFeedback = selectedCompanyFeedbacks[0] || null;
  const selectedCompanyFeedback = selectedCompanyFeedbacks.find(
    (feedback) => String(feedback.feedback_id) === String(selectedCompanyFeedbackId),
  ) || latestCompanyFeedback;

  useEffect(() => {
    setSelectedCompanyFeedbackId(latestCompanyFeedback?.feedback_id ? String(latestCompanyFeedback.feedback_id) : '');
  }, [latestCompanyFeedback?.feedback_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStudentId) {
      toast.warn('Please select a student.');
      return;
    }

    if (!comments.trim()) {
      toast.warn('Please write feedback or a comment before submitting.');
      return;
    }

    if (!selectedCompanyFeedbackId) {
      toast.warn('Please select company mentor feedback before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/mentor/provideFeedback/${selectedStudentId}`,
        { comments: comments.trim(), company_feedback_id: selectedCompanyFeedbackId },
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );

      toast.success('Feedback sent to the student successfully.');
      setComments('');
      setSelectedStudentId('');
      setSelectedCompanyFeedbackId('');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'An error occurred while sending feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto pb-12">
      <ToastContainer theme="colored" position="top-right" autoClose={3000} hideProgressBar />
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Send Student Feedback</h2>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Review company mentor feedback, then send academic comments to the student.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-teal-500" />
          </div>
        )}

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <div>
              <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">
                Select Student <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-sm appearance-none shadow-sm cursor-pointer"
              >
                <option value="">-- Assigned Student Roster --</option>
                {students.map((student) => (
                  <option key={student.student_id || student.id} value={student.student_id || student.id}>
                    {student.student_name || student.full_name || student.name || 'Student'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Action Type</label>
              <input
                type="text"
                value="Feedback / Comment"
                readOnly
                className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-500 font-bold focus:outline-none cursor-not-allowed shadow-inner"
              />
            </div>
          </div>

          {selectedStudent && (
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selected Student</p>
              <p className="font-bold text-slate-800 dark:text-white">{selectedStudent.student_name || selectedStudent.full_name || selectedStudent.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {selectedStudent.company_name || 'Organization not assigned'} - {selectedStudent.internship_title || 'Internship'}
              </p>
            </div>
          )}

          {selectedCompanyFeedback ? (
            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl">
              <p className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-2">
                Company Mentor Feedback Reference
              </p>
              {selectedCompanyFeedbacks.length > 1 && (
                <select
                  value={selectedCompanyFeedbackId}
                  onChange={(e) => setSelectedCompanyFeedbackId(e.target.value)}
                  className="mb-4 w-full px-4 py-3 rounded-xl border border-blue-100 dark:border-blue-800/40 bg-white dark:bg-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {selectedCompanyFeedbacks.map((feedback) => (
                    <option key={feedback.feedback_id} value={feedback.feedback_id}>
                      {feedback.created_at ? new Date(feedback.created_at).toLocaleDateString() : 'Recent'} - {feedback.feedback_type || 'Feedback'}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {selectedCompanyFeedback.company_mentor_name || 'Company Mentor'} - {selectedCompanyFeedback.company_name || 'Company'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                {selectedCompanyFeedback.overall_comment || selectedCompanyFeedback.feedback_text || 'No company mentor comment available.'}
              </p>
              {selectedCompanyFeedbacks.length > 1 && (
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-4">
                  Faculty feedback will be attached under the selected company feedback item.
                </p>
              )}
            </div>
          ) : selectedStudentId ? (
            <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-2xl">
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                No company mentor feedback has been submitted for this student yet.
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Feedback / Comment <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="6"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Write your feedback to the student after reviewing the company mentor's feedback..."
              required
              className="w-full px-5 py-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none leading-relaxed transition-all font-medium"
            />
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-3 border border-teal-500"
            >
              {submitting ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheckCircle} className="text-teal-300" />}
              {submitting ? 'Sending...' : 'Send Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorEvaluation;
