import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getInternshipProgressState } from '../../../utils/internshipProgress';

const ProgressTracker = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        const [studentsRes, reportsRes, feedbackRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mentor/students`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mentor/reports`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mentor/companyFeedback`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
        ]);

        setStudents(studentsRes.data?.students || []);
        setReports(reportsRes.data?.reports || []);
        setFeedbacks(feedbackRes.data?.feedbacks || []);
      } catch (error) {
        console.error('Failed to load mentor progress tracker', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchProgressData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const interns = useMemo(() => {
    return students.map((student) => {
      const studentId = String(student.student_id || '');
      const studentReports = reports.filter((report) => String(report.student_id || '') === studentId);
      const studentFeedback = feedbacks.find((feedback) => String(feedback.student_id || '') === studentId);
      const progressState = getInternshipProgressState({
        ...student,
        status: student.status,
      });
      const signedReport = studentReports.some((report) =>
        ['signed', 'approved'].includes((report.status || '').toLowerCase())
      );

      let progress = progressState.progress;
      let status = progressState.dormant ? 'Dormant' : 'On Track';

      if (!progressState.dormant && studentReports.length === 0) status = 'Needs Report';
      if (!progressState.dormant && studentReports.length > 0) progress = Math.max(progress, 75);
      if (!progressState.dormant && (signedReport || studentFeedback)) {
        status = 'Reviewed';
        progress = 100;
      }

      return {
        id: student.student_id,
        name: student.student_name || 'Student',
        org: student.company_name || 'Unassigned',
        role: student.internship_title || 'Internship Placement',
        progress,
        status,
        reports: `${studentReports.length} report${studentReports.length === 1 ? '' : 's'}`,
        progressMessage: progressState.message,
      };
    });
  }, [feedbacks, reports, students]);

  if (loading) {
    return (
      <div className="min-h-[320px] flex items-center justify-center text-teal-600 dark:text-teal-400">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Monitor Internship Progress</h2>
        <p className="text-slate-500 text-sm mt-1">Track completion rates and identify students requiring intervention.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {interns.map((intern) => (
          <div key={intern.id} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-teal-600 transition-colors">{intern.name}</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{intern.org} • {intern.role}</p>
              </div>
              <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                intern.status === 'On Track' || intern.status === 'Reviewed'
                  ? 'bg-teal-100 text-teal-700'
                  : intern.status === 'Needs Report'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-700'
              }`}>
                {intern.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                <span>Internship Completion</span>
                <span>{intern.progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${intern.status === 'Needs Report' ? 'bg-amber-500' : 'bg-teal-500'}`}
                  style={{ width: `${intern.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 font-semibold">{intern.progressMessage}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Reports Submitted</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{intern.reports}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Current State</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{intern.status}</p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <div className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold text-center">
                {intern.reports}
              </div>
              <div className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all shadow-lg text-center ${
                intern.status === 'Needs Report'
                  ? 'bg-amber-500 text-white shadow-amber-500/20'
                  : 'bg-teal-600 text-white shadow-teal-600/20'
              }`}>
                {intern.status === 'Reviewed' ? 'Feedback Ready' : 'Current Status'}
              </div>
            </div>
          </div>
        ))}
        {interns.length === 0 && (
          <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-100 dark:border-slate-800 shadow-sm text-center text-slate-400">
            No supervised students are available yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
