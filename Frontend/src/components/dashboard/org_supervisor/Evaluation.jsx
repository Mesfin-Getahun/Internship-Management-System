import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faClipboardCheck, faSpinner, faUser, faUsersSlash } from '@fortawesome/free-solid-svg-icons';

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

const getEvaluationPath = (student) =>
  `/org-supervisor/evaluate/${encodeURIComponent(`${student.internship_id}_${student.student_id}`)}`;

const Evaluation = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentsRes, evaluationsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company_mentor/students`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company_mentor/evaluations`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
        ]);

        setStudents(Array.isArray(studentsRes.data?.students) ? studentsRes.data.students : []);
        setEvaluations(Array.isArray(evaluationsRes.data?.evaluations) ? evaluationsRes.data.evaluations : []);
      } catch (error) {
        console.error('Failed to load evaluation roster.', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user?.token]);

  const evaluationKeys = useMemo(
    () => new Set(evaluations.map((item) => `${item.internship_id}_${item.student_id}`)),
    [evaluations]
  );
  const currentStudents = useMemo(() => students.filter(isCurrentPlacement), [students]);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Student Evaluations</h2>
          <p className="text-slate-500 text-sm mt-1">Select one of your assigned students to complete the full evaluation and attendance submission.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-emerald-500">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      ) : currentStudents.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
          <FontAwesomeIcon icon={faUsersSlash} size="3x" className="text-slate-300 mb-4" />
          <p className="text-xl font-bold text-slate-800 dark:text-white">No current students need evaluation</p>
          <p className="text-slate-500 text-sm mt-2">Current assigned interns will appear here until their final evaluation is submitted.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentStudents.map((student) => {
            const evaluationKey = `${student.internship_id}_${student.student_id}`;
            const hasEvaluation = evaluationKeys.has(evaluationKey);

            return (
              <Link
                to={getEvaluationPath(student)}
                key={evaluationKey}
                onClick={(event) => {
                  if (hasEvaluation) event.preventDefault();
                }}
                className={`block bg-white dark:bg-slate-800 p-5 rounded-2xl transition-all shadow-sm border border-slate-200 dark:border-slate-700 ${
                  hasEvaluation
                    ? 'cursor-default opacity-75'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-2xl">
                      <FontAwesomeIcon icon={faUser} className="text-emerald-600 dark:text-emerald-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white">{student.student_name || 'Assigned Intern'}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {student.department || 'Department unavailable'} - {student.company_name || 'Company'} - {student.internship_title || 'Internship'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      hasEvaluation
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                    }`}>
                      {hasEvaluation ? 'Evaluation Submitted' : 'Evaluation Ready'}
                    </span>
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                      <FontAwesomeIcon icon={faClipboardCheck} />
                      <FontAwesomeIcon icon={faChevronRight} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Evaluation;
