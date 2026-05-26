import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCheckCircle, faCommentDots, faFileAlt, faHistory, faSpinner, faUsers } from '@fortawesome/free-solid-svg-icons';

const activeStatuses = new Set(['accepted', 'in progress', 'active']);

const studentKey = (student) => `${student.internship_id}_${student.student_id}`;

const isCompletedPlacement = (student) => {
  const status = (student.status || '').toLowerCase();
  return (
    student.roster_status === 'completed' ||
    Number(student.is_completed) === 1 ||
    Boolean(student.evaluation_id) ||
    status === 'completed' ||
    status === 'complete'
  );
};

const isCurrentPlacement = (student) => activeStatuses.has((student.status || '').toLowerCase()) && !isCompletedPlacement(student);

const getEvaluationPath = (student) =>
  `/org-supervisor/evaluate/${encodeURIComponent(`${student.internship_id}_${student.student_id}`)}`;

const OrgSupervisorOverview = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [studentsRes, feedbacksRes, evaluationsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company_mentor/students`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company_mentor/feedbacks`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company_mentor/evaluations`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
        ]);

        setStudents(Array.isArray(studentsRes.data?.students) ? studentsRes.data.students : []);
        setFeedbacks(Array.isArray(feedbacksRes.data?.feedbacks) ? feedbacksRes.data.feedbacks : []);
        setEvaluations(Array.isArray(evaluationsRes.data?.evaluations) ? evaluationsRes.data.evaluations : []);
      } catch (error) {
        console.error('Failed to load org supervisor overview.', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user?.token]);

  const stats = useMemo(() => {
    const currentStudents = students.filter(isCurrentPlacement);
    const completedStudents = students.filter(isCompletedPlacement);
    const feedbackKeys = new Set(feedbacks.map((feedback) => `${feedback.internship_id}_${feedback.student_id}`));
    const evaluationKeys = new Set(evaluations.map((evaluation) => `${evaluation.internship_id}_${evaluation.student_id}`));
    const pendingFeedback = currentStudents.filter((student) => !feedbackKeys.has(studentKey(student))).length;
    const evaluationQueue = currentStudents.filter((student) => !evaluationKeys.has(studentKey(student)) && !student.evaluation_id).length;

    return [
      {
        id: 'students',
        label: 'Assigned Students',
        value: currentStudents.length,
        note: 'Students currently under your supervision.',
        icon: faUsers,
        path: '/org-supervisor/students',
        color: 'text-blue-600',
      },
      {
        id: 'evaluation',
        label: 'Evaluation Queue',
        value: evaluationQueue,
        note: 'Students ready for attendance and final evaluation.',
        icon: faFileAlt,
        path: '/org-supervisor/evaluation',
        color: 'text-emerald-600',
      },
      {
        id: 'feedback',
        label: 'Pending Feedbacks',
        value: pendingFeedback,
        note: 'Assigned students still waiting for supervisor feedback.',
        icon: faCommentDots,
        path: '/org-supervisor/feedback',
        color: 'text-amber-600',
      },
      {
        id: 'attendance',
        label: 'Attendance Workbench',
        value: currentStudents.length,
        note: 'Active placements ready for attendance review.',
        icon: faCheckCircle,
        path: '/org-supervisor/attendance',
        color: 'text-rose-600',
      },
      {
        id: 'completed',
        label: 'Completed History',
        value: completedStudents.length,
        note: 'Finished internships kept for later reference.',
        icon: faHistory,
        path: '/org-supervisor/students',
        color: 'text-violet-600',
      },
    ];
  }, [evaluations, feedbacks, students]);

  const currentStudents = useMemo(() => students.filter(isCurrentPlacement), [students]);
  const completedStudents = useMemo(() => students.filter(isCompletedPlacement), [students]);

  return (
    <div className="animate-fade-in space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Supervisor Control Center</h2>
        <p className="text-slate-500 text-sm mt-1">Live internship supervision data for your assigned students, evaluations, attendance, and feedback tasks.</p>
      </header>

      {loading ? (
        <div className="min-h-[320px] flex items-center justify-center text-emerald-600">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
            {stats.map((stat) => (
              <Link
                key={stat.id}
                to={stat.path}
                className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:-translate-y-1 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <FontAwesomeIcon icon={stat.icon} className={stat.color} />
                  </div>
                  <FontAwesomeIcon icon={faArrowRight} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mt-5">{stat.label}</h3>
                <p className={`text-3xl font-extrabold mt-2 ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-500 mt-2">{stat.note}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Assigned Students</h3>
                  <p className="text-sm text-slate-500 mt-1">Quick jump into the students you are currently supervising.</p>
                </div>
                <Link to="/org-supervisor/students" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">
                  View all
                </Link>
              </div>

              <div className="space-y-4">
                {currentStudents.slice(0, 4).map((student) => (
                  <Link
                    key={studentKey(student)}
                    to={getEvaluationPath(student)}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 hover:border-emerald-300 transition-all"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{student.student_name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{student.department || 'Department'} - {student.internship_title || 'Internship'}</p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Open</span>
                  </Link>
                ))}
                {currentStudents.length === 0 && (
                  <p className="text-sm text-slate-500">No students are currently assigned to this supervisor account.</p>
                )}
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-bold">Supervisor Highlights</h3>
              <p className="text-slate-400 text-sm mt-2">A quick operational summary based on your current database records.</p>
              <div className="mt-8 space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Recent Feedback Entries</p>
                  <p className="text-2xl font-extrabold mt-2">{feedbacks.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Students In Progress</p>
                  <p className="text-2xl font-extrabold mt-2">
                    {currentStudents.length}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Completed Internship History</p>
                  <p className="text-2xl font-extrabold mt-2">{completedStudents.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/20">
                  <p className="text-[10px] uppercase tracking-widest text-emerald-200 font-black">Best Next Step</p>
                  <p className="text-sm mt-2 text-emerald-50">Use the Evaluation or Feedback sections to complete the remaining records for each assigned student.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrgSupervisorOverview;
