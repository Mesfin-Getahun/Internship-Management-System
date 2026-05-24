import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';

const FulfillmentReports = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('All Faculties');
  const [loading, setLoading] = useState(true);
  const [closingYear, setClosingYear] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const authConfig = useMemo(
    () => user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : null,
    [user?.token],
  );

  const fetchAcademicYears = async () => {
    if (!authConfig) return;

    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/UIL/academic-years`,
      authConfig,
    );
    const years = Array.isArray(res.data?.years) ? res.data.years : [];
    setAcademicYears(years);
    setSelectedYearId((current) => current || String(years.find((year) => year.status === 'current')?.academic_year_id || ''));
  };

  const fetchReports = async () => {
    if (!authConfig) return;

    try {
      setLoading(true);
      setError('');
      setMessage('');
      const params = selectedYearId ? { academic_year_id: selectedYearId } : undefined;
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/UIL/fulfillmentReports`,
        { ...authConfig, params },
      );
      setRows(Array.isArray(res.data?.reports) ? res.data.reports : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load fulfillment reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authConfig) {
      fetchAcademicYears().catch((err) => {
        setError(err.response?.data?.message || 'Failed to load academic years.');
      });
    }
  }, [authConfig]);

  useEffect(() => {
    if (authConfig) fetchReports();
  }, [authConfig, selectedYearId]);

  const selectedYear = useMemo(
    () => academicYears.find((year) => String(year.academic_year_id) === String(selectedYearId)),
    [academicYears, selectedYearId],
  );

  const closeCurrentYear = async () => {
    if (!authConfig) return;

    const currentYear = academicYears.find((year) => year.status === 'current');
    const confirmed = window.confirm(
      `Close academic year ${currentYear?.label || 'current'}? Current placements with complete evidence will be archived, and the next year will become current.`,
    );

    if (!confirmed) return;

    try {
      setClosingYear(true);
      setError('');
      setMessage('');
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/UIL/academic-years/close-current`,
        {},
        authConfig,
      );
      setMessage(res.data?.message || 'Academic year closed successfully.');
      await fetchAcademicYears();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close academic year.');
    } finally {
      setClosingYear(false);
    }
  };

  const faculties = useMemo(() => {
    const names = rows.map((row) => row.faculty).filter(Boolean);
    return ['All Faculties', ...Array.from(new Set(names)).sort()];
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (selectedFaculty === 'All Faculties') return rows;
    return rows.filter((row) => row.faculty === selectedFaculty);
  }, [rows, selectedFaculty]);

  const exportCsv = () => {
    const headers = ['Academic Year', 'Student ID', 'Student Name', 'Faculty', 'Organization', 'Internship', 'Mentor Report', 'Organization Evaluation', 'Result'];
    const csvRows = filteredRows.map((row) => [
      row.academic_year_label || selectedYear?.label || '',
      row.student_id,
      row.student_name,
      row.faculty,
      row.company_name,
      row.internship_title,
      row.faculty_submitted_at ? 'Submitted to Faculty' : row.report_status || 'Pending',
      row.evaluation_id ? 'Completed' : 'Pending',
      row.evaluation_id && row.faculty_submitted_at ? 'Fulfilled' : 'Pending',
    ]);

    const csv = [headers, ...csvRows]
      .map((line) => line.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const yearPart = (selectedYear?.label || 'current').replace(/[^\w]+/g, '-').toLowerCase();
    link.download = `fulfillment-report-${yearPart}-${selectedFaculty.replace(/\s+/g, '-').toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in space-y-8">
      <header>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Fulfillment Reports</h2>
        <p className="text-slate-500 text-sm mt-1">Live internship completion data from reports and organization evaluations.</p>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-grow max-w-xs">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Academic Year</label>
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {academicYears.map((year) => (
                <option key={year.academic_year_id} value={year.academic_year_id}>
                  {year.label} {year.status === 'current' ? '(Current)' : '(Archived)'}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-grow max-w-xs">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Faculty Department</label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {faculties.map((faculty) => (
                <option key={faculty} value={faculty}>{faculty}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchReports}
            className="px-8 py-3 bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
          >
            Refresh
          </button>
          {selectedYear?.status === 'current' && (
            <button
              onClick={closeCurrentYear}
              disabled={closingYear}
              className="px-8 py-3 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
            >
              {closingYear ? 'Closing...' : 'Close Year'}
            </button>
          )}
          <button
            onClick={exportCsv}
            disabled={filteredRows.length === 0}
            className="px-8 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      {message && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{message}</p>}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold">Loading fulfillment data...</div>
        ) : filteredRows.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-bold">No fulfillment records found.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="p-5">Student Information</th>
                <th className="p-5">Year</th>
                <th className="p-5">Organization</th>
                <th className="p-5 text-center">Mentor Report</th>
                <th className="p-5 text-center">Org Eval</th>
                <th className="p-5 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {filteredRows.map((row, index) => {
                const reportDone = Boolean(row.faculty_submitted_at);
                const evalDone = Boolean(row.evaluation_id);
                const fulfilled = reportDone && evalDone;

                return (
                  <tr key={`${row.student_id}-${row.internship_id || index}`} className="hover:bg-slate-50/50">
                    <td className="p-5">
                      <div className="font-bold text-slate-800">{row.student_name || 'Student'}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{row.student_id}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{row.faculty || 'Faculty not set'}</div>
                    </td>
                    <td className="p-5 text-slate-500 font-bold uppercase tracking-tighter">
                      {row.academic_year_label || 'Current'}
                    </td>
                    <td className="p-5 text-slate-500 font-bold uppercase tracking-tighter">
                      {row.company_name || 'Not assigned'}
                    </td>
                    <td className="p-5 text-center font-black">
                      <span className={reportDone ? 'text-green-500' : 'text-amber-500'}>
                        {reportDone ? 'Submitted' : row.report_status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-5 text-center font-black">
                      <span className={evalDone ? 'text-green-500' : 'text-amber-500'}>
                        {evalDone ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <span className={`px-2 py-1 rounded-lg font-black uppercase text-[9px] ${fulfilled ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {fulfilled ? 'Fulfilled' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FulfillmentReports;
