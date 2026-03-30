import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faDownload, faUser, faUpload, faSpinner, faCheckCircle, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentSubmissions = () => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [reportsDb, setReportsDb] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingReportId, setUploadingReportId] = useState(null);
  const { user } = useAuth();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mentor/reports`, {
         headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = res.data.reports || res.data || [];
      setReportsDb(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchReports();
  }, [user]);

  // Derive active students from reports
  const students = Array.from(new Map(
    reportsDb.filter(r => r.student_id || r.studentName).map(r => [
       r.student_id || r.studentName,
       { id: r.student_id || r.studentName, name: r.student_name || r.studentName || 'Student' }
    ])
  ).values());

  const submissions = selectedStudentId 
    ? reportsDb.filter(r => (r.student_id || r.studentName).toString() === selectedStudentId.toString())
    : [];

  const handleDownload = (fileUrl) => {
    if (!fileUrl) {
       toast.error("No file URL available to download.");
       return;
    }
    window.open(`${import.meta.env.VITE_BACKEND_URL}/${fileUrl}`, '_blank');
  };

  const handleFileUpload = async (e, reportId) => {
     const file = e.target.files[0];
     if (!file) return;

     if (file.type !== 'application/pdf') {
         toast.error("Format denied. Only PDF files allowed.");
         return;
     }

     const formData = new FormData();
     formData.append('report', file);

     try {
        setUploadingReportId(reportId);
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/mentor/signReport/${reportId}`, formData, {
           headers: { 
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${user?.token}`
           }
        });
        toast.success("Digitally signed report uploaded successfully!");
        fetchReports(); // Refresh to catch status update
     } catch (err) {
        console.error(err);
        toast.error("Failed to upload the signed report.");
     } finally {
        setUploadingReportId(null);
        e.target.value = null; // reset input
     }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl animate-fade-in flex flex-col min-h-[500px]">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />
      <h2 className="text-3xl font-extrabold text-white mb-2">Student Submissions</h2>
      <p className="text-sm text-slate-400 mb-8 border-b border-slate-800 pb-6">Review raw documents, evaluate structure, and upload final signed PDFs back to candidates.</p>

      <div className="mb-8 max-w-sm">
        <label htmlFor="student-select" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
          Document Filter
        </label>
        <div className="relative">
            <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size="sm" />
            <select
                id="student-select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold appearance-none cursor-pointer"
                disabled={loading}
            >
                <option value="">-- View Inbox For --</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
            </select>
        </div>
      </div>

      {loading ? (
        <div className="flex-grow flex justify-center items-center h-40">
           <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-teal-500" />
        </div>
      ) : selectedStudentId ? (
        <div className="overflow-x-auto bg-slate-800/20 rounded-2xl border border-slate-700/50 flex-grow">
          <table className="min-w-full text-sm text-left text-slate-300">
            <thead className="bg-slate-800/80">
              <tr>
                <th scope="col" className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Document Type</th>
                <th scope="col" className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Submission Date</th>
                <th scope="col" className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-center">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {submissions && submissions.length > 0 ? (
                submissions.map(sub => (
                  <tr key={sub.report_id || sub.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-5 font-medium text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                         <FontAwesomeIcon icon={faFileAlt} />
                      </div>
                      {sub.report_type || sub.type || 'Final Report'} 
                    </td>
                    <td className="px-6 py-5 font-medium">{sub.submitted_date || sub.date ? new Date(sub.submitted_date || sub.date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-5">
                       <div className="flex justify-center gap-3">
                         <button 
                           onClick={() => handleDownload(sub.file_url || sub.file_path || sub.file)}
                           className="text-[10px] font-black uppercase tracking-widest px-4 py-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all border border-slate-700"
                           title="Download original"
                         >
                           <FontAwesomeIcon icon={faDownload} className="mr-2" /> Retrieve
                         </button>

                         <label className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all border cursor-pointer inline-flex items-center ${sub.status === 'Signed' || sub.status === 'Signed & Appproved' ? 'bg-teal-900/40 text-teal-400 border-teal-800 hover:bg-teal-900/60' : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white'}`}>
                           {uploadingReportId === (sub.report_id || sub.id) ? (
                              <><FontAwesomeIcon icon={faSpinner} spin className="mr-2 text-teal-400" /> Uploading</>
                           ) : sub.status === 'Signed' || sub.status === 'Signed & Appproved' ? (
                              <><FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-teal-400" /> Re-sign (PDF)</>
                           ) : (
                              <><FontAwesomeIcon icon={faUpload} className="mr-2 text-sky-400" /> Sign & Push (PDF)</>
                           )}
                           <input 
                              type="file" 
                              className="hidden" 
                              accept="application/pdf" 
                              onChange={(e) => handleFileUpload(e, sub.report_id || sub.id)} 
                              disabled={uploadingReportId !== null}
                           />
                         </label>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan="3" className="text-center py-12 text-slate-500 font-medium">
                        No submissions located for this identifier.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-grow flex flex-col justify-center items-center py-12 text-slate-500">
            <FontAwesomeIcon icon={faFolderOpen} size="3x" className="text-slate-700 mb-4" />
            <p className="font-bold text-lg text-slate-300">Awaiting Target Selection</p>
            <p className="text-sm mt-1 max-w-sm text-center">Hook into a student's submission directory using the selector above to download or inject signed records.</p>
        </div>
      )}
    </div>
  );
};

export default StudentSubmissions;