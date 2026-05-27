import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faDownload,
  faFileAlt,
  faFileCircleCheck,
  faFolderOpen,
  faSpinner,
  faUpload,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentSubmissions = () => {
  const { user } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [reportsDb, setReportsDb] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingReportId, setUploadingReportId] = useState(null);
  const [gradeForms, setGradeForms] = useState({});
  const [gradingReportId, setGradingReportId] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mentor/reports`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const reports = Array.isArray(res.data?.reports) ? res.data.reports : [];
      setReportsDb(reports);
      setGradeForms(Object.fromEntries(
        reports.map((report) => [
          String(report.report_id),
          report.mentor_report_mark ?? '',
        ])
      ));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load student reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchReports();
    } else {
      setLoading(false);
    }
  }, [user?.token]);

  const students = useMemo(
    () =>
      Array.from(
        new Map(
          reportsDb
            .filter((report) => report.student_id)
            .map((report) => [
              String(report.student_id),
              {
                id: String(report.student_id),
                name: report.student_name || 'Student',
              },
            ])
        ).values()
      ),
    [reportsDb]
  );

  useEffect(() => {
    if (!selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].id);
    }
  }, [selectedStudentId, students]);

  const submissions = useMemo(() => {
    if (!selectedStudentId) {
      return reportsDb;
    }

    return reportsDb.filter(
      (report) => String(report.student_id || '') === String(selectedStudentId)
    );
  }, [reportsDb, selectedStudentId]);

  const summary = useMemo(
    () => ({
      total: reportsDb.length,
      pending: reportsDb.filter(
        (report) =>
          !['signed', 'approved', 'faculty_submitted'].includes((report.status || '').toLowerCase()) &&
          !report.faculty_submitted_at
      ).length,
      signed: reportsDb.filter(
        (report) =>
          report.mentor_signed_url ||
          report.faculty_submitted_at ||
          ['signed', 'approved', 'faculty_submitted'].includes((report.status || '').toLowerCase())
      ).length,
    }),
    [reportsDb]
  );

  const handleDownload = (fileUrl, label) => {
    if (!fileUrl) {
      toast.error(`No ${label} file is available yet.`);
      return;
    }

    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFileUpload = async (event, reportId) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files can be uploaded.');
      event.target.value = null;
      return;
    }

    const formData = new FormData();
    formData.append('report', file);

    try {
      setUploadingReportId(reportId);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/mentor/signReport/${reportId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      toast.success(res.data?.message || 'Signed report uploaded successfully.');
      await fetchReports();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload the signed report.');
    } finally {
      setUploadingReportId(null);
      event.target.value = null;
    }
  };

  const handleGradeChange = (reportId, value) => {
    setGradeForms((prev) => ({
      ...prev,
      [String(reportId)]: value,
    }));
  };

  const saveReportGrade = async (report) => {
    const reportId = report.report_id;
    const reportMark = Number(gradeForms[String(reportId)]);

    if (!Number.isFinite(reportMark) || reportMark < 0 || reportMark > 20) {
      toast.warn('Report grade must be from 0 to 20.');
      return;
    }

    try {
      setGradingReportId(reportId);
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/mentor/reports/${encodeURIComponent(reportId)}/grade`,
        { report_mark: reportMark },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      setReportsDb((prev) => prev.map((item) => (
        String(item.report_id) === String(reportId)
          ? {
              ...item,
              mentor_report_mark: res.data?.report_mark ?? reportMark,
            }
          : item
      )));
      toast.success(res.data?.message || 'Report grade saved.');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save report grade.');
    } finally {
      setGradingReportId(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <ToastContainer theme="colored" position="top-right" autoClose={3000} hideProgressBar />

      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Student Reports</h2>
        <p className="text-slate-500 text-sm mt-1">
          Download each submitted report, review and sign it locally, then upload the signed PDF back through the mentor workflow.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          ['Total Reports', summary.total],
          ['Waiting For Signature', summary.pending],
          ['Signed Reports', summary.signed],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-6 rounded-3xl"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white mt-2">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8">
        <label
          htmlFor="student-select"
          className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2"
        >
          Filter By Student
        </label>
        <div className="relative max-w-md">
          <FontAwesomeIcon
            icon={faUser}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size="sm"
          />
          <select
            id="student-select"
            value={selectedStudentId}
            onChange={(event) => setSelectedStudentId(event.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-sm appearance-none cursor-pointer shadow-sm disabled:opacity-50"
            disabled={loading || students.length === 0}
          >
            {students.length === 0 ? (
              <option value="">No students with reports</option>
            ) : (
              students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8">
        {loading ? (
          <div className="flex justify-center items-center h-48 text-teal-500">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[240px] text-center text-slate-500">
            <FontAwesomeIcon icon={faFolderOpen} size="3x" className="text-slate-300 mb-4" />
            <p className="text-xl font-bold text-slate-700 dark:text-white">No Reports Available</p>
            <p className="text-sm mt-2 max-w-md">
              Submitted reports will appear here once one of your assigned students uploads a file.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Submitted</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Report Grade</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {submissions.map((report) => {
                  const isSigned = ['signed', 'approved'].includes(
                    (report.status || '').toLowerCase()
                  ) || Boolean(report.mentor_signed_url) || Boolean(report.faculty_submitted_at) || (report.status || '').toLowerCase() === 'faculty_submitted';

                  return (
                    <tr
                      key={report.report_id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-white flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                            <FontAwesomeIcon icon={faFileAlt} />
                          </div>
                          <div>
                            <div>{report.student_name || 'Student'}</div>
                            <div className="text-xs text-slate-500">{report.report_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {report.submitted_at
                          ? new Date(report.submitted_at).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                            isSigned
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                          }`}
                        >
                          {isSigned ? 'Signed' : report.status || 'Submitted'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.01"
                            value={gradeForms[String(report.report_id)] ?? ''}
                            onChange={(event) => handleGradeChange(report.report_id, event.target.value)}
                            disabled={!isSigned}
                            className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            placeholder="0"
                          />
                          <span className="text-xs font-bold text-slate-400">/20</span>
                          <button
                            type="button"
                            onClick={() => saveReportGrade(report)}
                            disabled={!isSigned || gradingReportId === report.report_id}
                            className="rounded-lg bg-teal-600 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-teal-700 disabled:opacity-60"
                          >
                            {gradingReportId === report.report_id ? 'Saving' : 'Save'}
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownload(report.report_url, 'submitted')}
                            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:text-teal-600 transition-all"
                          >
                            <FontAwesomeIcon icon={faDownload} className="mr-2" />
                            Download Original
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownload(report.mentor_signed_url, 'signed')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                              report.mentor_signed_url
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40'
                                : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                            }`}
                          >
                            <FontAwesomeIcon icon={faFileCircleCheck} className="mr-2" />
                            Download Signed
                          </button>

                          <label
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border cursor-pointer inline-flex items-center transition-all ${
                              isSigned
                                ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 border-teal-200 dark:border-teal-900/40'
                                : 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400 border-sky-200 dark:border-sky-900/40'
                            }`}
                          >
                            {uploadingReportId === report.report_id ? (
                              <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Uploading
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon
                                  icon={isSigned ? faCheckCircle : faUpload}
                                  className="mr-2"
                                />
                                {isSigned ? 'Replace Signed PDF' : 'Upload Signed PDF'}
                              </>
                            )}
                            <input
                              type="file"
                              className="hidden"
                              accept="application/pdf"
                              onChange={(event) => handleFileUpload(event, report.report_id)}
                              disabled={uploadingReportId !== null}
                            />
                          </label>
                        </div>
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

export default StudentSubmissions;
