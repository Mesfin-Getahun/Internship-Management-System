import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserGraduate,
  faBriefcase,
  faClipboardCheck,
  faFileAlt,
  faSpinner,
  faBellSlash,
} from '@fortawesome/free-solid-svg-icons';

const MentorOverview = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const [profileRes, studentsRes, reportsRes, feedbackRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mentor/profile`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
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

        setProfile(profileRes.data?.profile || null);
        setStudents(studentsRes.data?.students || []);
        setReports(reportsRes.data?.reports || []);
        setFeedbacks(feedbackRes.data?.feedbacks || []);
      } catch (error) {
        console.error('Failed to load mentor overview', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchOverview();
    } else {
      setLoading(false);
    }
  }, [user]);

  const overview = useMemo(() => {
    const derivedAssignedStudents = students.length;
    const derivedActiveInternships = students.filter(
      (student) => (student.status || '').toLowerCase() === 'in progress'
    ).length;
    const totalAssignedStudents = Math.max(
      Number(profile?.total_students || 0),
      derivedAssignedStudents
    );
    const activeInternships = Math.max(
      Number(profile?.active_internships || 0),
      derivedActiveInternships
    );
    const pendingReports = reports.filter(
      (report) => !['signed', 'approved'].includes((report.status || '').toLowerCase())
    ).length;
    const awaitingFeedback = students.filter((student) => {
      const studentId = String(student.student_id || '');
      return studentId && !feedbacks.some((feedback) => String(feedback.student_id || '') === studentId);
    }).length;

    const activities = [
      ...reports.map((report) => ({
        id: `report-${report.report_id}`,
        text: `${report.student_name || 'Student'} submitted a report`,
        time: report.submitted_at || report.created_at,
        badgeClass: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
      })),
      ...feedbacks.map((feedback) => ({
        id: `feedback-${feedback.feedback_id}`,
        text: `${feedback.company_name || 'Company'} sent feedback for ${feedback.student_name || 'a student'}`,
        time: feedback.created_at,
        badgeClass: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      })),
      ...students.map((student) => ({
        id: `student-${student.student_id}`,
        text: `${student.student_name || 'Student'} is under your supervision`,
        time: null,
        badgeClass: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
      })),
    ]
      .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
      .slice(0, 5);

    return {
      mentorName: profile?.full_name || user?.full_name || user?.name || 'Mentor',
      stats: [
        {
          label: 'Assigned Students',
          val: totalAssignedStudents,
          sub: 'Total assigned',
          icon: faUserGraduate,
          cardClass: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
          subClass: 'text-teal-600 dark:text-teal-400',
        },
        {
          label: 'Active Internships',
          val: activeInternships,
          sub: 'From assigned students',
          icon: faBriefcase,
          cardClass: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
          subClass: 'text-blue-600 dark:text-blue-400',
        },
        {
          label: 'Awaiting Feedback',
          val: awaitingFeedback,
          sub: 'Needs comment',
          icon: faClipboardCheck,
          cardClass: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
          subClass: 'text-amber-600 dark:text-amber-400',
        },
        {
          label: 'Pending Reports',
          val: pendingReports,
          sub: 'Waiting for signing',
          icon: faFileAlt,
          cardClass: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
          subClass: 'text-rose-600 dark:text-rose-400',
        },
      ],
      reportCompliance: reports.length === 0
        ? 0
        : Math.round(((reports.length - pendingReports) / reports.length) * 100),
      activities,
      reportCount: reports.length,
      feedbackCount: feedbacks.length,
    };
  }, [feedbacks, profile, reports, students, user]);

  if (loading) {
    return (
      <div className="min-h-[360px] flex items-center justify-center text-teal-600 dark:text-teal-400">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome, {overview.mentorName}</h2>
        <p className="text-slate-500 text-sm mt-1 font-medium">Overview of your assigned interns and their academic supervision status.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overview.stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${stat.cardClass}`}>
              <FontAwesomeIcon icon={stat.icon} className="h-6 w-6" />
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-800 dark:text-white">{stat.val}</span>
              <span className={`text-[10px] font-bold ${stat.subClass}`}>{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white">Recent Student Activity</h3>
            <span className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400">Live Feed</span>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {overview.activities.length > 0 ? overview.activities.map((activity) => (
              <div key={activity.id} className="p-5 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activity.badgeClass}`}>
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-snug">{activity.text}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
                    {activity.time ? new Date(activity.time).toLocaleDateString() : 'Current assignment'}
                  </p>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-slate-400">
                <FontAwesomeIcon icon={faBellSlash} className="h-8 w-8 mb-3" />
                <p className="font-semibold">No mentor activity has been recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-teal-900 text-white rounded-3xl p-8 relative overflow-hidden group shadow-xl shadow-teal-900/20">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-2">Mentor Actions</h4>
              <p className="text-teal-400 text-xs mb-6 font-medium">Direct access to supervision tools.</p>
              <div className="space-y-3">
                <div className="w-full py-3 bg-white/10 rounded-xl text-sm font-bold px-4 flex justify-between items-center">
                  <span>Review Reports</span>
                  <span>{overview.reportCount}</span>
                </div>
                <div className="w-full py-3 bg-white/10 rounded-xl text-sm font-bold px-4 flex justify-between items-center">
                  <span>Company Feedback</span>
                  <span>{overview.feedbackCount}</span>
                </div>
                <div className="w-full py-3 bg-teal-500 rounded-xl text-sm font-bold text-center shadow-lg shadow-black/20">
                  Students Under Supervision: {students.length}
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-colors"></div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4">Report Compliance</h4>
            <div className="flex items-end justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Weekly Submissions</span>
              <span className="text-xs font-black text-teal-600">{overview.reportCompliance}%</span>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: `${overview.reportCompliance}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 italic">Maintain high compliance to ensure students stay on track for academic credit.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorOverview;
