import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faChevronRight, faSpinner, faTriangleExclamation, faUsersSlash } from '@fortawesome/free-solid-svg-icons';

const Attendance = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company_mentor/students`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setStudents(Array.isArray(res.data?.students) ? res.data.students : []);
      } catch (error) {
        console.error('Failed to load attendance roster.', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchStudents();
    } else {
      setLoading(false);
    }
  }, [user?.token]);

  const summary = useMemo(
    () => ({
      total: students.length,
      active: students.filter((student) => (student.status || '').toLowerCase() === 'in progress').length,
    }),
    [students]
  );

  return (
    <div className="animate-fade-in space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Attendance Tracker</h2>
        <p className="text-slate-500 text-sm mt-1">Attendance is included in the supervisor evaluation workflow for every assigned student.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Students</p>
          <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">{summary.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Placements</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{summary.active}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        {loading ? (
          <div className="flex justify-center py-20 text-emerald-500">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-14 text-slate-500">
            <FontAwesomeIcon icon={faUsersSlash} size="3x" className="text-slate-300 mb-4" />
            <p className="font-bold text-slate-800 dark:text-white">No students assigned yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((student) => (
              <Link
                key={`${student.internship_id}_${student.student_id}`}
                to={`/org-supervisor/evaluate/${student.internship_id}_${student.student_id}`}
                className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalendarCheck} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{student.student_name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{student.internship_title || 'Internship'} • {student.department || 'Department'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-500" />
                  Record attendance
                  <FontAwesomeIcon icon={faChevronRight} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
