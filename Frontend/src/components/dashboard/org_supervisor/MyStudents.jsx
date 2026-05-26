import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faChevronRight, faHistory, faSpinner, faUser, faUsersSlash } from '@fortawesome/free-solid-svg-icons';

const activeStatuses = new Set(['accepted', 'in progress', 'active']);

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

const getEvaluationPath = (student) => {
  const target = `${student.internship_id || student.id || 'default'}_${student.student_id || student.user_id || 'student'}`;
  return `/org-supervisor/evaluate/${encodeURIComponent(target)}`;
};

const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [studentView, setStudentView] = useState('current');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company_mentor/students`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = res.data.students || res.data || [];
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch supervised students:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchStudents();
  }, [user]);

  const currentStudents = useMemo(() => students.filter(isCurrentPlacement), [students]);
  const completedStudents = useMemo(() => students.filter(isCompletedPlacement), [students]);
  const visibleStudents = useMemo(() => {
    if (studentView === 'completed') return completedStudents;
    if (studentView === 'all') return students;
    return currentStudents;
  }, [completedStudents, currentStudents, studentView, students]);

  const tabs = [
    { id: 'current', label: 'Active / Current', count: currentStudents.length },
    { id: 'completed', label: 'Completed History', count: completedStudents.length },
    { id: 'all', label: 'All Students', count: students.length },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl min-h-[400px] flex flex-col justify-center animate-fade-in">
      {!loading && (
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Supervision Roster</h2>
          <p className="text-slate-400 text-sm mt-1 border-b border-slate-800 pb-6">
            Current interns stay in the action list, while completed internships remain available as history.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center py-12 text-slate-400">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mb-4 text-emerald-500" />
          <p className="font-bold">Syncing assignment roster...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-12 text-slate-500 text-center">
          <FontAwesomeIcon icon={faUsersSlash} size="3x" className="mb-4 text-slate-700" />
          <p className="font-bold text-lg text-slate-300">No Roster Assignments</p>
          <p className="text-sm mt-1 max-w-sm">You have not been assigned any interns by the platform administrator yet.</p>
        </div>
      ) : (
        <div>
          <div className="mb-6 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStudentView(tab.id)}
                className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                  studentView === tab.id
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {visibleStudents.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-12 text-slate-500 text-center">
              <FontAwesomeIcon icon={faUsersSlash} size="3x" className="mb-4 text-slate-700" />
              <p className="font-bold text-lg text-slate-300">No Students In This View</p>
              <p className="text-sm mt-1 max-w-sm">Switch tabs to see current assignments, completed history, or all assigned students.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleStudents.map((student) => {
                const completed = isCompletedPlacement(student);
                const itemKey = `${student.internship_id || student.id || 'default'}_${student.student_id || student.user_id || 'student'}`;
                const content = (
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-5 min-w-0">
                      <div className={`w-14 h-14 p-3 rounded-2xl flex items-center justify-center shadow-inner transition-colors ${
                        completed
                          ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                          : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white'
                      }`}>
                        <FontAwesomeIcon icon={completed ? faHistory : faUser} size="lg" />
                      </div>
                      <div className="min-w-0">
                        <h3 className={`font-bold text-lg truncate transition-colors ${
                          completed ? 'text-white' : 'text-white group-hover:text-emerald-400'
                        }`}>
                          {student.student_name || student.full_name || student.name || 'Assigned Intern'}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">
                          ID: {student.student_id ? student.student_id.substring(0, 8) : 'N/A'} {student.department ? `- ${student.department}` : ''}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          {student.internship_title || 'Internship'} {student.company_name ? `at ${student.company_name}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10px] border font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors ${
                        completed
                          ? 'bg-green-500/10 border-green-500/20 text-green-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/50'
                      }`}>
                        {completed ? 'Completed' : 'Assess'}
                      </span>
                      {completed ? (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                      ) : (
                        <FontAwesomeIcon icon={faChevronRight} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      )}
                    </div>
                  </div>
                );

                return completed ? (
                  <div
                    key={itemKey}
                    className="block bg-slate-800/40 p-6 rounded-2xl border border-slate-700 shadow-sm"
                  >
                    {content}
                  </div>
                ) : (
                  <Link
                    to={getEvaluationPath(student)}
                    key={itemKey}
                    className="block bg-slate-800/50 hover:bg-slate-700 p-6 rounded-2xl transition-all border border-slate-700 hover:border-slate-600 group shadow-sm hover:shadow-lg"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyStudents;
