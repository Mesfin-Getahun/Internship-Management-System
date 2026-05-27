import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faStar, faBuilding, faFileAlt, faSpinner, faCommentSlash, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { getDepartmentOptions, matchesDepartment } from '../../../utils/departmentFilters';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EvaluationModal = ({ evaluation, onClose }) => {
  if (!evaluation) return null;

  const rating = evaluation.rating || evaluation.score || (evaluation.total_mark ? Math.min(5, Math.round(evaluation.total_mark / 20)) : 5);

  const renderStars = (rating) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <FontAwesomeIcon icon={faStar} key={i} size="sm" className={i < rating ? 'text-amber-400 fill-current' : 'text-slate-200 dark:text-slate-600'} />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl m-4 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
               <FontAwesomeIcon icon={faFileAlt} size="sm" /> 
            </div>
            Evaluation Details
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-grow">
          <div className="flex justify-between items-start bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Student</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{evaluation.student_name || evaluation.student || 'Student Name'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Evaluation Target</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white flex items-center justify-end gap-2">
                <FontAwesomeIcon icon={faBuilding} className="text-slate-400 text-sm" />
                {evaluation.target || evaluation.company_name || 'Organization'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-3">Overall Rating</p>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
               {renderStars(rating)}
               <span className="font-bold text-slate-700 dark:text-slate-300">({rating}.0 / 5.0)</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['Company', evaluation.total_mark, 40],
              ['Attendance', evaluation.faculty_attendance_mark, 10],
              ['Report', evaluation.mentor_report_mark, 20],
              ['Presentation', evaluation.final_presentation_mark, 30],
              ['Known Total', evaluation.known_total_mark, 100],
            ].map(([label, value, max]) => (
              <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                <p className="mt-2 text-xl font-black text-slate-800 dark:text-white">
                  {value ?? '-'}<span className="text-xs text-slate-400"> / {max}</span>
                </p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-3">Comments & Feedback</p>
            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">"{evaluation.summary || evaluation.comments || evaluation.feedback_text || `Total mark: ${evaluation.total_mark || 'N/A'}`}"</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-3">Submitted Files</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href={evaluation.assessment_pdf_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  evaluation.assessment_pdf_url
                    ? 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    : 'border-slate-100 dark:border-slate-800 opacity-60 pointer-events-none'
                }`}
              >
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Assessment File</span>
                <FontAwesomeIcon icon={faPaperclip} className="text-indigo-500" />
              </a>
              <a
                href={evaluation.attendance_pdf_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  evaluation.attendance_pdf_url
                    ? 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    : 'border-slate-100 dark:border-slate-800 opacity-60 pointer-events-none'
                }`}
              >
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Attendance File</span>
                <FontAwesomeIcon icon={faPaperclip} className="text-indigo-500" />
              </a>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Evaluation submitted on {evaluation.submitted_at || evaluation.date || evaluation.created_at ? new Date(evaluation.submitted_at || evaluation.date || evaluation.created_at).toLocaleDateString() : 'N/A'}
        </div>
      </div>
    </div>
  );
};

const FacultyOrgEvaluations = () => {
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [evaluations, setEvaluations] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [gradeForms, setGradeForms] = useState({});
  const [savingGradeId, setSavingGradeId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        const authConfig = {
           headers: { Authorization: `Bearer ${user?.token}` }
        };
        const [evaluationsRes, studentsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/companyEvaluation`, authConfig),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/students`, authConfig),
        ]);
        const data = evaluationsRes.data.evaluations || evaluationsRes.data || [];
        setEvaluations(data);
        setGradeForms(Object.fromEntries(
          data.map((evaluation) => [
            String(evaluation.evaluation_id),
            evaluation.faculty_attendance_mark ?? '',
          ])
        ));
        setStudents(Array.isArray(studentsRes.data?.students) ? studentsRes.data.students : []);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
    };
    if (user?.token) fetchEvaluations();
  }, [user]);

  const departments = useMemo(() => {
    return getDepartmentOptions(students, evaluations);
  }, [evaluations, students]);

  const filteredEvaluations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return evaluations.filter((evaluation) => {
      const studentName = (evaluation.student_name || evaluation.student || '').toLowerCase();
      const studentId = String(evaluation.student_id || '').toLowerCase();
      const companyName = (evaluation.company_name || evaluation.target || '').toLowerCase();
      const internshipTitle = (evaluation.internship_title || '').toLowerCase();
      const matchesSearch =
        !query ||
        studentName.includes(query) ||
        studentId.includes(query) ||
        companyName.includes(query) ||
        internshipTitle.includes(query);

      return matchesDepartment(evaluation, selectedDepartment) && matchesSearch;
    });
  }, [evaluations, searchTerm, selectedDepartment]);

  const renderStars = (rating) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <FontAwesomeIcon icon={faStar} key={i} size="xs" className={i < rating ? 'text-amber-400 fill-current' : 'text-slate-200 dark:text-slate-700'} />
      ))}
    </div>
  );

  const handleOpenEvaluation = async (evaluation) => {
    if (!user?.token || !evaluation?.evaluation_id) {
      setSelectedEvaluation(evaluation);
      return;
    }

    try {
      setDetailLoading(true);
      setDetailLoadingId(evaluation.evaluation_id);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/faculty/companyEvaluation/${encodeURIComponent(evaluation.evaluation_id)}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSelectedEvaluation({ ...evaluation, ...(res.data?.evaluation || {}) });
    } catch (err) {
      console.error(err);
      setSelectedEvaluation(evaluation);
    } finally {
      setDetailLoading(false);
      setDetailLoadingId(null);
    }
  };

  const handleAttendanceGradeChange = (evaluationId, value) => {
    setGradeForms((prev) => ({
      ...prev,
      [String(evaluationId)]: value,
    }));
  };

  const saveAttendanceGrade = async (evaluation) => {
    const evaluationId = evaluation.evaluation_id;
    const attendanceMark = Number(gradeForms[String(evaluationId)]);

    if (!Number.isFinite(attendanceMark) || attendanceMark < 0 || attendanceMark > 10) {
      toast.warn('Attendance grade must be from 0 to 10.');
      return;
    }

    try {
      setSavingGradeId(evaluationId);
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/faculty/companyEvaluation/${encodeURIComponent(evaluationId)}/attendance-grade`,
        { attendance_mark: attendanceMark },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      setEvaluations((prev) => prev.map((item) => (
        String(item.evaluation_id) === String(evaluationId)
          ? {
              ...item,
              faculty_attendance_mark: res.data?.attendance_mark ?? attendanceMark,
              known_total_mark: res.data?.known_total_mark ?? item.known_total_mark,
            }
          : item
      )));
      toast.success(res.data?.message || 'Attendance grade saved.');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save attendance grade.');
    } finally {
      setSavingGradeId(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <ToastContainer theme="colored" position="top-right" autoClose={3000} hideProgressBar />
      <EvaluationModal evaluation={selectedEvaluation} onClose={() => setSelectedEvaluation(null)} />
      
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Student Evaluations</h2>
        <p className="text-slate-500 text-sm mt-1">Review feedback ratings provided by host organizations.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-6 rounded-3xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="relative flex-1">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Search Evaluation</label>
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 bottom-3.5 text-slate-400" size="sm" />
          <input 
            type="text" 
            placeholder="Search by student, company, or internship..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="w-full md:w-72">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Department</label>
          <select
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </div>
        </div>
      </div>

      {loading ? (
         <div className="flex justify-center items-center h-64 text-indigo-500">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
         </div>
      ) : filteredEvaluations.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-8 rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Organization</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Internship</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Rating</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Grade</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Files</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Attendance Grade</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEvaluations.map((e, idx) => {
                  const rating = e.rating || e.score || (e.total_mark ? Math.min(5, Math.round(e.total_mark / 20)) : 5);
                  const isLoadingDetails = detailLoading && detailLoadingId === e.evaluation_id;

                  return (
                    <tr key={e.evaluation_id || e.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-white">{e.student_name || e.student || 'Student Name'}</div>
                        <div className="text-xs text-slate-500">{e.student_id || 'No ID'} | {e.department || 'No Department'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <FontAwesomeIcon icon={faBuilding} size="sm" className="text-slate-400" />
                          {e.company_name || e.target || 'Organization'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">{e.internship_title || 'No internship'}</div>
                        <div className="text-xs text-slate-500">
                          {e.submitted_at ? new Date(e.submitted_at).toLocaleDateString() : 'No date'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 w-fit">
                          {renderStars(rating)}
                          <span className="text-[10px] font-black text-slate-500">({rating}.0)</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                          <p className="text-lg font-black text-slate-800 dark:text-white">
                            {e.known_total_mark ?? 0}
                            <span className="text-xs text-slate-400"> / 100</span>
                          </p>
                          <p className={`mt-1 text-[10px] font-black uppercase tracking-widest ${
                            e.presentation_status === 'disputed'
                              ? 'text-rose-500'
                              : e.presentation_status === 'agreed'
                                ? 'text-emerald-500'
                                : 'text-amber-500'
                          }`}>
                            Presentation: {e.presentation_status || 'pending'}
                          </p>
                          <p className="mt-2 text-[10px] font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
                            Attendance {e.faculty_attendance_mark ?? '-'}/10 | Company {e.total_mark ?? '-'}/40 | Mentor {e.mentor_report_mark ?? '-'}/20 | Evaluators {e.final_presentation_mark ?? '-'}/30
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <a
                            href={e.assessment_pdf_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                              e.assessment_pdf_url
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                : 'bg-slate-100 text-slate-400 pointer-events-none'
                            }`}
                          >
                            Assessment
                          </a>
                          <a
                            href={e.attendance_pdf_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                              e.attendance_pdf_url
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-400 pointer-events-none'
                            }`}
                          >
                            Attendance
                          </a>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.01"
                            value={gradeForms[String(e.evaluation_id)] ?? ''}
                            onChange={(event) => handleAttendanceGradeChange(e.evaluation_id, event.target.value)}
                            className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            placeholder="0"
                          />
                          <span className="text-xs font-bold text-slate-400">/10</span>
                          <button
                            type="button"
                            onClick={() => saveAttendanceGrade(e)}
                            disabled={savingGradeId === e.evaluation_id}
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {savingGradeId === e.evaluation_id ? 'Saving' : 'Save'}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenEvaluation(e)}
                          className="bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 text-slate-600 dark:text-slate-300 hover:text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-lg transition-all active:scale-95"
                        >
                          {isLoadingDetails ? 'Loading...' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm min-h-[300px]">
          <FontAwesomeIcon icon={faCommentSlash} size="3x" className="text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-white">No Evaluations Found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">No evaluation criteria matches the current filters.</p>
        </div>
      )}
    </div>
  );
};

export default FacultyOrgEvaluations;
