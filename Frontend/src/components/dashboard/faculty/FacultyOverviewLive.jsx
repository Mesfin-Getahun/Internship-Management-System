import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faUserTie,
  faBriefcase,
  faHourglassHalf,
  faPaperPlane,
  faCheckCircle,
  faFileAlt,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

const statStyles = {
  blue: {
    icon: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    text: 'text-blue-600 dark:text-blue-400',
  },
  emerald: {
    icon: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  indigo: {
    icon: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
  amber: {
    icon: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
  },
};

const FacultyOverviewLive = () => {
  const [students, setStudents] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        setError('');
        const authConfig = {
          headers: { Authorization: `Bearer ${user?.token}` },
        };
        const [studentsRes, evaluationsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/students`, authConfig),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/companyEvaluation`, authConfig),
        ]);

        setStudents(Array.isArray(studentsRes.data?.students) ? studentsRes.data.students : []);
        setEvaluations(Array.isArray(evaluationsRes.data?.evaluations) ? evaluationsRes.data.evaluations : []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load faculty overview.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchOverviewData();
    } else {
      setLoading(false);
      setError('Faculty session token is missing. Please sign in again.');
    }
  }, [user?.token]);

  const summary = useMemo(() => {
    const assignedMentors = students.filter((student) => student.university_mentor_id).length;
    const activePlacements = students.filter((student) => student.internship_id).length;
    const pendingMentorAssignments = students.filter((student) => !student.university_mentor_id).length;
    const avgMentorLoad = assignedMentors === 0
      ? 0
      : assignedMentors / new Set(students.filter((student) => student.university_mentor_id).map((student) => student.university_mentor_id)).size;

    return {
      totalStudents: students.length,
      assignedMentors,
      activePlacements,
      pendingMentorAssignments,
      avgMentorLoad,
    };
  }, [students]);

  const stats = [
    { label: 'Faculty Students', val: summary.totalStudents, sub: 'Scoped to your faculty', icon: faUsers, color: 'blue' },
    { label: 'Assigned Mentors', val: summary.assignedMentors, sub: 'Students with university mentors', icon: faUserTie, color: 'emerald' },
    { label: 'Active Placements', val: summary.activePlacements, sub: 'Students linked to internships', icon: faBriefcase, color: 'indigo' },
    { label: 'Pending Assignments', val: summary.pendingMentorAssignments, sub: 'Students still needing mentors', icon: faHourglassHalf, color: 'amber' },
  ];

  const recentActivity = useMemo(() => {
    const activities = [];

    students
      .filter((student) => student.university_mentor_name)
      .slice(0, 2)
      .forEach((student) => {
        activities.push({
          text: `${student.full_name} is assigned to ${student.university_mentor_name}.`,
          time: student.internship_status || 'Mentor assigned',
          icon: faCheckCircle,
          color: 'emerald',
        });
      });

    evaluations.slice(0, 2).forEach((evaluation) => {
      activities.push({
        text: `${evaluation.student_name} received an evaluation from ${evaluation.company_name || 'an organization'}.`,
        time: evaluation.submitted_at ? new Date(evaluation.submitted_at).toLocaleDateString() : 'Evaluation submitted',
        icon: faFileAlt,
        color: 'amber',
      });
    });

    if (activities.length === 0) {
      activities.push({
        text: 'No recent faculty activity is available yet.',
        time: 'Waiting for backend data',
        icon: faPaperPlane,
        color: 'blue',
      });
    }

    return activities.slice(0, 4);
  }, [evaluations, students]);

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Faculty Dashboard Overview</h2>
        <p className="text-slate-500 text-sm mt-1 font-medium">Overview values are now computed from the faculty backend data.</p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-indigo-500">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 text-slate-500 dark:text-slate-400">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const style = statStyles[stat.color];
              return (
                <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                  <div className={`w-12 h-12 rounded-2xl ${style.icon} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                    <FontAwesomeIcon icon={stat.icon} className="h-6 w-6" />
                  </div>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-slate-800 dark:text-white">{stat.val}</span>
                    <span className={`text-[10px] font-bold ${style.text}`}>{stat.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white">Recent Activity</h3>
                <button onClick={() => navigate('/faculty/manage-students')} className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 hover:underline">Open Student List</button>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {recentActivity.map((activity, index) => {
                  const style = statStyles[activity.color];
                  return (
                    <div key={`${activity.text}-${index}`} className="p-5 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className={`w-10 h-10 rounded-xl ${style.icon} flex items-center justify-center shrink-0`}>
                        <FontAwesomeIcon icon={activity.icon} className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-snug">{activity.text}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 dark:bg-emerald-900/20 rounded-3xl p-8 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="text-xl font-bold mb-2">Quick Actions</h4>
                  <p className="text-slate-400 text-xs mb-6 font-medium">Faculty actions linked to the live backend pages.</p>
                  <div className="space-y-3">
                    <button onClick={() => navigate('/faculty/assign-mentors')} className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all text-left px-4 flex justify-between items-center group/btn">
                      Assign Mentor
                      <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity">-&gt;</span>
                    </button>
                    <button onClick={() => navigate('/faculty/manage-students')} className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all text-left px-4 flex justify-between items-center group/btn">
                      Review Students
                      <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity">-&gt;</span>
                    </button>
                    <button onClick={() => navigate('/faculty/org-evaluations')} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold transition-all text-center">
                      View Evaluations
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors"></div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                <h4 className="font-bold text-slate-800 dark:text-white mb-4">Mentor Assignment Coverage</h4>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">Students already assigned</span>
                  <span className="text-xs font-black text-emerald-600">
                    {summary.totalStudents === 0 ? '0%' : `${Math.round((summary.assignedMentors / summary.totalStudents) * 100)}%`}
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-1000"
                    style={{
                      width: `${summary.totalStudents === 0 ? 0 : Math.round((summary.assignedMentors / summary.totalStudents) * 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 italic">
                  {summary.pendingMentorAssignments} student(s) are still waiting for a university mentor assignment.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FacultyOverviewLive;
