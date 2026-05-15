import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faFilePdf, faPaperclip, faSearch } from '@fortawesome/free-solid-svg-icons';

const FacultyReportsLive = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/reports`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setReports(Array.isArray(res.data?.reports) ? res.data.reports : []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load faculty reports.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchReports();
    else {
      setLoading(false);
      setError('Faculty session token is missing. Please sign in again.');
    }
  }, [user?.token]);

  const departments = useMemo(() => {
    const names = reports.map((report) => report.department).filter(Boolean);
    return ['All Departments', ...Array.from(new Set(names)).sort()];
  }, [reports]);

  const filteredReports = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesDepartment =
        selectedDepartment === 'All Departments' || report.department === selectedDepartment;
      const studentName = (report.student_name || '').toLowerCase();
      const studentId = String(report.student_id || '').toLowerCase();
      const matchesSearch = !query || studentName.includes(query) || studentId.includes(query);

      return matchesDepartment && matchesSearch;
    });
  }, [reports, searchTerm, selectedDepartment]);

  const summary = useMemo(() => ({
    total: filteredReports.length,
    departments: departments.length - 1,
    signed: filteredReports.filter((report) => report.mentor_signed_url).length,
  }), [departments.length, filteredReports]);

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Reports & Statistics</h2>
        <p className="text-slate-500 text-sm mt-1">Only reports submitted to faculty are shown here.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          ['Faculty Submitted', summary.total],
          ['Departments', summary.departments],
          ['Mentor Signed', summary.signed],
        ].map(([label, value]) => (
          <div key={label} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-6 rounded-3xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-6 rounded-3xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="relative flex-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Search Student</label>
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 bottom-3.5 text-slate-400" size="sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by student name or ID..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-8 rounded-3xl">
        {loading ? (
          <div className="flex justify-center py-20 text-indigo-500">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
        ) : error ? (
          <div className="text-center text-slate-500 dark:text-slate-400">{error}</div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center text-slate-500 dark:text-slate-400">No faculty-submitted reports match this search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Internship</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Submitted</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Files</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReports.map((report) => (
                  <tr key={report.report_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-white">{report.student_name}</div>
                      <div className="text-xs text-slate-500">{report.student_id} | {report.department || 'No Department'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">{report.internship_title || 'No internship'}</div>
                      <div className="text-xs text-slate-500">{report.company_name || 'No company'}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                      {report.submitted_at ? new Date(report.submitted_at).toLocaleDateString() : 'Submitted to Faculty'}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <a
                          href={report.file_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            report.file_url
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                              : 'bg-slate-100 text-slate-400 pointer-events-none'
                          }`}
                        >
                          <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                          Report
                        </a>
                        <a
                          href={report.mentor_signed_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            report.mentor_signed_url
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-400 pointer-events-none'
                          }`}
                        >
                          <FontAwesomeIcon icon={faPaperclip} className="mr-2" />
                          Signed
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyReportsLive;
