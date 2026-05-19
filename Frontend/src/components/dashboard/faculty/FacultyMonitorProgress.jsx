import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faSearch,
  faChevronDown,
  faChevronUp,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { getInternshipProgressState } from '../../../utils/internshipProgress';

const statusConfig = {
  Dormant: {
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    icon: faExclamationTriangle,
  },
  'Pending Approval': {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: faExclamationTriangle,
  },
  'In Progress': {
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    icon: null,
  },
  Approved: {
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: faCheckCircle,
  },
  Completed: {
    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    icon: faCheckCircle,
  },
  Rejected: {
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    icon: faTimesCircle,
  },
};

const FacultyMonitorProgress = () => {
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const { user } = useAuth();

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        setError('');
        const authConfig = {
          headers: { Authorization: `Bearer ${user?.token}` },
        };

        const [studentsRes, reportsRes, evaluationsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/students`, authConfig),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/reports`, authConfig),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/companyEvaluation`, authConfig),
        ]);

        setStudents(Array.isArray(studentsRes.data?.students) ? studentsRes.data.students : []);
        setReports(Array.isArray(reportsRes.data?.reports) ? reportsRes.data.reports : []);
        setEvaluations(Array.isArray(evaluationsRes.data?.evaluations) ? evaluationsRes.data.evaluations : []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load faculty progress data.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchProgressData();
    } else {
      setLoading(false);
      setError('Faculty session token is missing. Please sign in again.');
    }
  }, [user?.token]);

  const progressRows = useMemo(() => {
    const reportsByStudent = new Map();
    reports.forEach((report) => {
      reportsByStudent.set(String(report.student_id), report);
    });

    const evaluationsByStudent = new Map();
    evaluations.forEach((evaluation) => {
      evaluationsByStudent.set(String(evaluation.student_id), evaluation);
    });

    return students.map((student) => {
      const studentId = String(student.student_id);
      const report = reportsByStudent.get(studentId);
      const evaluation = evaluationsByStudent.get(studentId);

      const progressState = getInternshipProgressState({
        ...student,
        status: student.internship_status,
      });

      let progress = progressState.progress;
      if (!progressState.dormant && report?.file_url) progress = Math.max(progress, 75);
      if (!progressState.dormant && evaluation?.evaluation_id) progress = 100;

      const attendance = evaluation?.attendance_pdf_url
        ? 'Submitted'
        : report?.status
          ? 'Pending Verification'
          : 'Pending';

      const evaluationStatus = evaluation?.evaluation_id ? 'Completed' : 'Pending';

      let status = progressState.dormant ? 'Dormant' : 'In Progress';
      const internshipStatus = String(student.internship_status || '').toLowerCase();
      const reportStatus = String(report?.status || '').toLowerCase();
      const completedByDate = !progressState.dormant && progressState.label === 'Completed';
      const completedByStatus = ['completed', 'complete'].includes(internshipStatus);

      if (internshipStatus === 'rejected') {
        status = 'Rejected';
      } else if (
        !progressState.dormant &&
        (['signed', 'approved', 'faculty_submitted'].includes(reportStatus) || report?.faculty_submitted_at)
      ) {
        status = 'Approved';
      } else if (!progressState.dormant && report?.file_url && evaluation?.evaluation_id) {
        status = 'Pending Approval';
      }
      if (completedByDate || completedByStatus) {
        status = 'Completed';
        progress = 100;
      }

      return {
        id: student.student_id,
        name: student.full_name || 'Student',
        company: student.company_name || 'No company assigned',
        mentor: student.university_mentor_name || 'Not Assigned',
        progress,
        attendance,
        evaluation: evaluationStatus,
        status,
        progressMessage: progressState.message,
      };
    });
  }, [evaluations, reports, students]);

  const sortedStudents = useMemo(() => {
    const sortableItems = [...progressRows];
    sortableItems.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [progressRows, sortConfig]);

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return sortedStudents;

    return sortedStudents.filter((student) =>
      student.name.toLowerCase().includes(query) ||
      student.company.toLowerCase().includes(query) ||
      student.mentor.toLowerCase().includes(query),
    );
  }, [searchTerm, sortedStudents]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending'
      ? <FontAwesomeIcon icon={faChevronUp} size={16} />
      : <FontAwesomeIcon icon={faChevronDown} size={16} />;
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Monitor Student Progress & Completion</h2>
        <p className="text-slate-500 text-sm mt-1">Progress is calculated from faculty students, submitted reports, and organization evaluations.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm rounded-3xl p-8">
        <div className="mb-6">
          <div className="relative max-w-md">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by student, company, or mentor..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-3 pl-10 pr-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64 text-indigo-500">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
        ) : error ? (
          <div className="text-center text-slate-500 dark:text-slate-400 py-16">{error}</div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center text-slate-500 dark:text-slate-400 py-16">No progress rows matched your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-slate-600 dark:text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {['name', 'company', 'mentor', 'progress', 'attendance', 'evaluation', 'status'].map((key) => (
                    <th key={key} scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort(key)}>
                      <div className="flex items-center gap-1">
                        {key.replace('_', ' ')}
                        {getSortIcon(key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((student) => {
                  const config = statusConfig[student.status] || statusConfig['In Progress'];
                  const Icon = config.icon;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{student.name}</td>
                      <td className="px-6 py-4">{student.company}</td>
                      <td className="px-6 py-4">{student.mentor}</td>
                      <td className="px-6 py-4 min-w-40">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                          <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${student.progress}%` }}></div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold mt-2">{student.progress}%</div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-1">{student.progressMessage}</div>
                      </td>
                      <td className="px-6 py-4">{student.attendance}</td>
                      <td className="px-6 py-4">{student.evaluation}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${config.badge}`}>
                          {Icon ? <FontAwesomeIcon icon={Icon} size="sm" /> : null}
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyMonitorProgress;
