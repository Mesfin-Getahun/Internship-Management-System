import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faUserPlus, faUsers } from '@fortawesome/free-solid-svg-icons';

const FacultyPresentationEvaluators = () => {
  const { user } = useAuth();
  const [evaluators, setEvaluators] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedEvaluators, setSelectedEvaluators] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone_number: '' });

  const authConfig = user?.token
    ? { headers: { Authorization: `Bearer ${user.token}` } }
    : null;

  const isCompletedPlacement = (student) => {
    const status = String(student.internship_status || student.status || '').toLowerCase();
    const endDateValue = student.placement_end_date || student.end_date;
    const endDate = endDateValue ? new Date(endDateValue) : null;

    if (status === 'completed' || status === 'complete') return true;
    if (!endDate || Number.isNaN(endDate.getTime())) return false;

    endDate.setHours(23, 59, 59, 999);
    return endDate < new Date();
  };

  const fetchData = async () => {
    if (!authConfig) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [evaluatorsRes, studentsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/evaluators`, authConfig),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/students`, authConfig),
      ]);

      setEvaluators(Array.isArray(evaluatorsRes.data?.evaluators) ? evaluatorsRes.data.evaluators : []);
      setStudents(
        (Array.isArray(studentsRes.data?.students) ? studentsRes.data.students : [])
          .filter((student) => student.student_id && student.internship_id && isCompletedPlacement(student))
      );
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to load presentation evaluator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.token]);

  const selectedEvaluatorObjects = useMemo(
    () => evaluators.filter((evaluator) => selectedEvaluators.includes(String(evaluator.evaluator_id))),
    [evaluators, selectedEvaluators],
  );

  const toggleEvaluator = (evaluatorId) => {
    const id = String(evaluatorId);
    setSelectedEvaluators((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 2) {
        toast.warn('Choose only two evaluators for the presentation room.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const toggleStudent = (student) => {
    const key = `${student.student_id}_${student.internship_id}`;
    setSelectedStudents((prev) =>
      prev.some((item) => item.key === key)
        ? prev.filter((item) => item.key !== key)
        : [...prev, { key, student_id: student.student_id, internship_id: student.internship_id }],
    );
  };

  const createEvaluator = async (event) => {
    event.preventDefault();

    if (!form.full_name.trim() || !form.email.trim()) {
      toast.warn('Evaluator name and email are required.');
      return;
    }

    try {
      setSaving(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/faculty/evaluators`,
        form,
        authConfig,
      );
      toast.success(
        `${res.data?.message || 'Evaluator created.'} Temporary password: ${res.data?.temporary_password || 'email + full name'}`,
      );
      setForm({ full_name: '', email: '', phone_number: '' });
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create evaluator.');
    } finally {
      setSaving(false);
    }
  };

  const assignEvaluators = async () => {
    if (selectedEvaluators.length !== 2) {
      toast.warn('Select exactly two evaluators.');
      return;
    }

    if (selectedStudents.length === 0) {
      toast.warn('Select at least one student placement.');
      return;
    }

    const overloaded = selectedEvaluatorObjects.find(
      (evaluator) => Number(evaluator.assigned_students || 0) + selectedStudents.length > 30,
    );

    if (overloaded) {
      toast.warn(`${overloaded.full_name} would exceed 30 assigned students.`);
      return;
    }

    try {
      setSaving(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/faculty/presentation-evaluators/assign`,
        {
          evaluator_ids: selectedEvaluators,
          students: selectedStudents.map(({ student_id, internship_id }) => ({ student_id, internship_id })),
        },
        authConfig,
      );
      toast.success(res.data?.message || 'Presentation evaluators assigned.');
      setSelectedStudents([]);
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to assign presentation evaluators.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <ToastContainer theme="colored" position="top-right" autoClose={3500} hideProgressBar />
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Presentation Evaluators</h2>
        <p className="text-slate-500 text-sm mt-1">Create examiner accounts and assign the same two evaluators after the internship is completed.</p>
      </header>

      <form onSubmit={createEvaluator} className="grid gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
        <label>
          <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Full Name</span>
          <input
            value={form.full_name}
            onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            required
          />
        </label>
        <label>
          <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            required
          />
        </label>
        <label>
          <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Phone</span>
          <input
            value={form.phone_number}
            onChange={(event) => setForm((prev) => ({ ...prev, phone_number: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 disabled:opacity-60"
        >
          <FontAwesomeIcon icon={faUserPlus} />
          Add
        </button>
      </form>

      {loading ? (
        <div className="flex h-56 items-center justify-center text-emerald-500">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-1 text-lg font-bold text-slate-800 dark:text-white">1. Choose Two Evaluators</h3>
            <p className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">{selectedEvaluators.length} / 2 selected</p>
            <div className="space-y-3">
              {evaluators.map((evaluator) => {
                const selected = selectedEvaluators.includes(String(evaluator.evaluator_id));
                const load = Number(evaluator.assigned_students || 0);
                return (
                  <button
                    key={evaluator.evaluator_id}
                    type="button"
                    onClick={() => toggleEvaluator(evaluator.evaluator_id)}
                    disabled={load >= 30 && !selected}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      selected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                        : 'border-slate-100 bg-slate-50 hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-800/50'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{evaluator.full_name}</p>
                        <p className="text-xs text-slate-500">{evaluator.email}</p>
                      </div>
                      <span className="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-600 dark:bg-slate-900 dark:text-slate-300">{load} / 30</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-1 text-lg font-bold text-slate-800 dark:text-white">2. Select Students</h3>
            <p className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">{selectedStudents.length} selected</p>
            <div className="max-h-[470px] space-y-3 overflow-y-auto pr-2">
              {students.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
                  No completed student placements available for presentation assignment.
                </div>
              ) : students.map((student) => {
                const key = `${student.student_id}_${student.internship_id}`;
                const selected = selectedStudents.some((item) => item.key === key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleStudent(student)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      selected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                        : 'border-slate-100 bg-slate-50 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 dark:bg-slate-900">
                        <FontAwesomeIcon icon={faUsers} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{student.full_name || student.student_name}</p>
                        <p className="text-xs text-slate-500">{student.internship_title || 'Internship'} - {student.company_name || 'Company'}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={assignEvaluators}
          disabled={saving || selectedEvaluators.length !== 2 || selectedStudents.length === 0}
          className="rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Assign Same Two Evaluators'}
        </button>
      </div>
    </div>
  );
};

export default FacultyPresentationEvaluators;
