import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import DashboardChangePassword from '../../components/dashboard/common/DashboardChangePassword.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardCheck, faKey, faRightFromBracket, faSpinner, faUsers } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EvaluatorDashboardShell = ({ children }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const active = location.pathname.split('/').pop() || 'assignments';

  const links = [
    { id: 'assignments', label: 'Presentations', icon: faClipboardCheck },
    { id: 'change-password', label: 'Change Password', icon: faKey },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 lg:flex">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-800 bg-slate-900 px-4 pt-24 lg:block">
        <nav className="space-y-2">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#/evaluator/${link.id}`}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                active === link.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={link.icon} />
              {link.label}
            </a>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-400 transition-all hover:bg-red-950/20"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            Logout
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 pb-10 pt-24 sm:px-6 lg:ml-64">
        {children}
      </main>
    </div>
  );
};

const EvaluatorAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [gradeForms, setGradeForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/evaluator/assignments`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const rows = Array.isArray(res.data?.assignments) ? res.data.assignments : [];
      setAssignments(rows);
      setGradeForms(Object.fromEntries(
        rows.map((item) => [`${item.student_id}_${item.internship_id}`, item.own_mark ?? ''])
      ));
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to load presentation assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchAssignments();
    else setLoading(false);
  }, [user?.token]);

  const summary = useMemo(() => ({
    total: assignments.length,
    agreed: assignments.filter((item) => item.presentation_status === 'agreed').length,
    disputed: assignments.filter((item) => item.presentation_status === 'disputed').length,
  }), [assignments]);

  const saveGrade = async (assignment) => {
    const key = `${assignment.student_id}_${assignment.internship_id}`;
    const mark = Number(gradeForms[key]);

    if (!Number.isFinite(mark) || mark < 0 || mark > 30) {
      toast.warn('Presentation mark must be from 0 to 30.');
      return;
    }

    try {
      setSavingKey(key);
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/evaluator/assignments/${encodeURIComponent(assignment.student_id)}/${encodeURIComponent(assignment.internship_id)}/grade`,
        { mark },
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );
      toast.success(res.data?.message || 'Presentation grade saved.');
      await fetchAssignments();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to save presentation grade.');
    } finally {
      setSavingKey('');
    }
  };

  return (
    <div className="space-y-8">
      <ToastContainer theme="colored" position="top-right" autoClose={3500} hideProgressBar />
      <header>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Presentation Evaluation</h1>
        <p className="mt-1 text-sm text-slate-500">Enter the physical presentation mark. Final `/30` is agreed only when both assigned evaluators submit the same mark.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Assigned Students', summary.total],
          ['Agreed Grades', summary.agreed],
          ['Disputed Grades', summary.disputed],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-black text-slate-800 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex h-52 items-center justify-center text-emerald-500">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex h-52 flex-col items-center justify-center text-center text-slate-500">
            <FontAwesomeIcon icon={faUsers} size="2x" className="mb-3 text-slate-300" />
            <p className="font-bold text-slate-700 dark:text-white">No assigned presentations yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Evaluators</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Marks</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Your Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assignments.map((assignment) => {
                  const key = `${assignment.student_id}_${assignment.internship_id}`;
                  const hasSubmittedMark = assignment.own_mark !== null && assignment.own_mark !== undefined;
                  return (
                    <tr key={key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-4">
                        <p className="font-bold text-slate-800 dark:text-white">{assignment.student_name}</p>
                        <p className="text-xs text-slate-500">{assignment.internship_title || 'Internship'} - {assignment.company_name || 'Company'}</p>
                      </td>
                      <td className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {assignment.evaluators?.map((item) => item.full_name).join(', ') || 'Assigned pair'}
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                        {assignment.grades?.length
                          ? assignment.grades.map((grade) => `${grade.evaluator_name || grade.evaluator_id}: ${grade.mark}/30`).join(' | ')
                          : 'No marks yet'}
                      </td>
                      <td className="p-4">
                        <span className={`rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest ${
                          assignment.presentation_status === 'agreed'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                            : assignment.presentation_status === 'disputed'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
                        }`}>
                          {assignment.presentation_status}
                          {assignment.final_presentation_mark !== null && assignment.final_presentation_mark !== undefined
                            ? ` ${assignment.final_presentation_mark}/30`
                            : ''}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="30"
                            step="0.01"
                            value={gradeForms[key] ?? ''}
                            onChange={(event) => setGradeForms((prev) => ({ ...prev, [key]: event.target.value }))}
                            disabled={hasSubmittedMark}
                            className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => saveGrade(assignment)}
                            disabled={savingKey === key || hasSubmittedMark}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {hasSubmittedMark ? 'Submitted' : savingKey === key ? 'Saving' : 'Save'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

const EvaluatorDashboard = () => (
  <EvaluatorDashboardShell>
    <Routes>
      <Route path="/" element={<Navigate to="assignments" replace />} />
      <Route path="assignments" element={<EvaluatorAssignments />} />
      <Route path="change-password" element={<DashboardChangePassword />} />
    </Routes>
  </EvaluatorDashboardShell>
);

export default EvaluatorDashboard;
