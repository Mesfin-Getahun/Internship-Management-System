import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faSpinner, faUsersSlash } from '@fortawesome/free-solid-svg-icons';

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

  const currentStudents = useMemo(() => students.filter(isCurrentPlacement), [students]);

  const summary = useMemo(
    () => ({
      total: currentStudents.length,
      active: currentStudents.length,
    }),
    [currentStudents],
  );

  return (
    <div className="animate-fade-in space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Attendance Tracker</h2>
        <p className="text-slate-500 text-sm mt-1">Review the attendance roster and active placement count for your assigned students.</p>
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
        ) : currentStudents.length === 0 ? (
          <div className="text-center py-14 text-slate-500">
            <FontAwesomeIcon icon={faUsersSlash} size="3x" className="text-slate-300 mb-4" />
            <p className="font-bold text-slate-800 dark:text-white">No current students assigned yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentStudents.map((student) => (
              <div
                key={`${student.internship_id}_${student.student_id}`}
                className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalendarCheck} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{student.student_name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {student.internship_title || 'Internship'} - {student.department || 'Department'}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  (student.status || '').toLowerCase() === 'in progress'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {student.status || 'Assigned'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
