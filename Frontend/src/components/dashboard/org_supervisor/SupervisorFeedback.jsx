import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faFileAlt, faPaperPlane, faPaperclip, faSpinner, faStar, faTimes, faUsersSlash } from '@fortawesome/free-solid-svg-icons';

const SupervisorFeedback = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    feedback_type: 'weekly',
    rating: 0,
    strengths: '',
    weaknesses: '',
    suggestions: '',
    overall_comment: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, feedbacksRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company_mentor/students`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company_mentor/feedbacks`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        }),
      ]);

      const studentRows = Array.isArray(studentsRes.data?.students) ? studentsRes.data.students : [];
      setStudents(studentRows);
      setFeedbacks(Array.isArray(feedbacksRes.data?.feedbacks) ? feedbacksRes.data.feedbacks : []);

      if (!selectedKey && studentRows.length > 0) {
        setSelectedKey(`${studentRows[0].internship_id}_${studentRows[0].student_id}`);
      }
    } catch (error) {
      console.error('Failed to load supervisor feedback data.', error);
      toast.error('Failed to load supervisor feedback data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user?.token]);

  const selectedStudent = useMemo(
    () =>
      students.find(
        (student) => `${student.internship_id}_${student.student_id}` === selectedKey
      ) || null,
    [selectedKey, students]
  );

  const studentFeedbacks = useMemo(() => {
    if (!selectedStudent) return feedbacks;

    return feedbacks.filter(
      (feedback) =>
        String(feedback.student_id) === String(selectedStudent.student_id) &&
        String(feedback.internship_id) === String(selectedStudent.internship_id)
    );
  }, [feedbacks, selectedStudent]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedStudent) {
      toast.warn('Select a student first.');
      return;
    }

    if (!form.overall_comment.trim()) {
      toast.warn('Please enter feedback comments.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value ?? '');
      });
      if (attachmentFile) {
        formData.append('attachment', attachmentFile);
      }

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/company_mentor/feedBack/${selectedStudent.internship_id}/${selectedStudent.student_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Feedback submitted successfully.');
      setForm({
        feedback_type: 'weekly',
        rating: 0,
        strengths: '',
        weaknesses: '',
        suggestions: '',
        overall_comment: '',
      });
      setAttachmentFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await fetchData();
    } catch (error) {
      console.error('Failed to submit supervisor feedback.', error);
      toast.error(error.response?.data?.message || 'Failed to submit supervisor feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <ToastContainer theme="colored" position="top-right" autoClose={3000} hideProgressBar />

      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Supervisor Feedback</h2>
        <p className="text-slate-500 text-sm mt-1">Send structured performance feedback for each assigned student and review your previous submissions.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Student</label>
            <select
              value={selectedKey}
              onChange={(event) => setSelectedKey(event.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 px-4 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-sm appearance-none cursor-pointer shadow-sm"
              disabled={loading || students.length === 0}
            >
              {students.length === 0 ? (
                <option value="">No students assigned</option>
              ) : (
                students.map((student) => (
                  <option key={`${student.internship_id}_${student.student_id}`} value={`${student.internship_id}_${student.student_id}`}>
                    {student.student_name} - {student.internship_title || 'Internship'}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Feedback Type</label>
              <select
                value={form.feedback_type}
                onChange={(event) => setForm((prev) => ({ ...prev, feedback_type: event.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 px-4 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-sm"
              >
                <option value="weekly">Weekly</option>
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, rating: value }))}
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${
                      form.rating >= value
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <FontAwesomeIcon icon={faStar} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {[
            ['strengths', 'Strengths'],
            ['weaknesses', 'Weaknesses'],
            ['suggestions', 'Suggestions'],
            ['overall_comment', 'Overall Comment'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</label>
              <textarea
                rows={key === 'overall_comment' ? 5 : 3}
                value={form[key]}
                onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                className="w-full px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
                placeholder={`Enter ${label.toLowerCase()}...`}
              />
            </div>
          ))}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Supporting Document</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.csv,.txt,application/pdf,image/png,image/jpeg,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/plain"
              className="hidden"
              onChange={(event) => setAttachmentFile(event.target.files?.[0] || null)}
            />
            <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-700 dark:text-white">
                    {attachmentFile ? attachmentFile.name : 'Attach evidence, screenshots, or supporting files'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">PDF, image, Word, Excel, CSV, or text file up to 5 MB.</p>
                </div>
                <div className="flex gap-2">
                  {attachmentFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setAttachmentFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-700"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      Remove
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-slate-700 dark:bg-slate-700"
                  >
                    <FontAwesomeIcon icon={faPaperclip} />
                    Choose File
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={submitting || !selectedStudent}
              className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-3"
            >
              <FontAwesomeIcon icon={submitting ? faSpinner : faPaperPlane} spin={submitting} />
              {submitting ? 'Sending...' : 'Submit Feedback'}
            </button>
          </div>
        </form>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Feedback History</h3>
              <p className="text-sm text-slate-500 mt-1">Recent feedback entries for the selected student.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faCommentDots} />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20 text-emerald-500">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            </div>
          ) : studentFeedbacks.length === 0 ? (
            <div className="text-center py-14 text-slate-500">
              <FontAwesomeIcon icon={faUsersSlash} size="3x" className="text-slate-300 mb-4" />
              <p className="font-bold text-slate-800 dark:text-white">No feedback submitted yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[820px] overflow-y-auto pr-2">
              {studentFeedbacks.map((feedback) => (
                <div key={feedback.feedback_id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{feedback.student_name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{feedback.feedback_type || 'Feedback'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">{Number(feedback.rating || 0).toFixed(1)} / 5</p>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400">
                        {feedback.created_at ? new Date(feedback.created_at).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{feedback.overall_comment || 'No comment provided.'}</p>
                  {feedback.attachment_url && (
                    <a
                      href={feedback.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-700 shadow-sm transition-all hover:bg-emerald-50 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-700"
                    >
                      <FontAwesomeIcon icon={faFileAlt} />
                      {feedback.attachment_name || 'Open Attachment'}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupervisorFeedback;
