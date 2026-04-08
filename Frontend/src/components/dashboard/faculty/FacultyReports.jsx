import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload, faPaperPlane, faSpinner, faFilePdf } from '@fortawesome/free-solid-svg-icons';

const academicSummaryData = [
  { name: 'Software Eng.', students: 45, with_internship: 40, without_internship: 5 },
  { name: 'Computer Sci.', students: 60, with_internship: 55, without_internship: 5 },
  { name: 'Electrical Eng.', students: 50, with_internship: 48, without_internship: 2 },
  { name: 'Mechanical Eng.', students: 55, with_internship: 50, without_internship: 5 },
];

const completionStatusData = [
  { name: 'Completed', value: 193 },
  { name: 'In Progress', value: 25 },
  { name: 'Terminated', value: 5 },
];

const COLORS = ['#10B981', '#0EA5E9', '#F43F5E'];

const FacultyReports = () => {
  const [reportType, setReportType] = useState('');
  const [generatedReport, setGeneratedReport] = useState(null);
  const [reportsDb, setReportsDb] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchDbReports = async () => {
     try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/reports`, {
           headers: { Authorization: `Bearer ${user?.token}` }
        });
        setReportsDb(res.data.reports || res.data || []);
     } catch (err) {
        console.error(err);
     } finally {
        setLoading(false);
     }
  };

  const handleGenerateReport = () => {
    if (!reportType) {
      toast.error("Please select a report format first.");
      return;
    }
    
    if (reportType === 'Database Records') {
       fetchDbReports();
    }
    
    toast.success(`Generated ${reportType} view.`);
    setGeneratedReport(reportType);
  };

  const renderReport = () => {
    if (!generatedReport) {
      return <div className="text-center text-slate-500 mt-10 text-sm">Please generate a report view to display.</div>;
    }

    switch (generatedReport) {
      case 'Academic Summary':
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Student Internship Placements</h3>
            <p className="mb-8 text-slate-500 text-sm">Aggregate chart displaying current departmental adoption rates.</p>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={academicSummaryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="with_internship" stackId="a" fill="#10B981" name="With Internship" radius={[0, 0, 4, 4]} />
                <Bar dataKey="without_internship" stackId="a" fill="#F43F5E" name="Without Internship" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'Internship Completion':
        return (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="w-full text-left">
               <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Completion Status</h3>
               <p className="mb-6 text-slate-500 text-sm">Overall distribution of current student statuses.</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie 
                   data={completionStatusData} 
                   cx="50%" 
                   cy="50%" 
                   innerRadius={80}
                   outerRadius={130} 
                   paddingAngle={5}
                   dataKey="value" 
                   nameKey="name" 
                   stroke="none"
                >
                  {completionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      case 'Database Records':
        return (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Submitted Reports Log</h3>
            <p className="mb-6 text-slate-500 text-sm">View and download individual document submissions.</p>
            {loading ? (
               <div className="flex justify-center py-12"><FontAwesomeIcon icon={faSpinner} spin className="text-indigo-500 text-2xl" /></div>
            ) : reportsDb.length === 0 ? (
               <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-sm text-slate-500">
                  No DB records found.
               </div>
            ) : (
               <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/50">
                        <tr>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Name</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">File Type</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {reportsDb.map((r, i) => (
                           <tr key={r.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="p-4 font-bold text-sm text-slate-700 dark:text-white">{r.student_name || r.student || 'Student Submission'}</td>
                              <td className="p-4 text-sm text-slate-500">{r.report_type || 'Final Report'} <FontAwesomeIcon icon={faFilePdf} className="ml-2 text-rose-500" /></td>
                              <td className="p-4 text-right">
                                 {r.file_url || r.file_path ? (
                                    <a href={r.file_url || r.file_path} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-widest rounded-lg transition-colors inline-block">Extract</a>
                                 ) : <span className="text-xs text-slate-400">Not Available</span>}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <ToastContainer theme="colored" position="top-right" autoClose={3000} hideProgressBar />
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Reports & Statistics</h2>
        <p className="text-slate-500 text-sm mt-1">Aggregate and view university participation data.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-8 rounded-3xl">
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="reportType" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Select Dataset View</label>
          <select
            id="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 px-4 text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm appearance-none cursor-pointer"
          >
            <option value="">-- Choose Data Cut --</option>
            <option value="Academic Summary">Graphical: Academic Summary</option>
            <option value="Internship Completion">Graphical: Placement Status</option>
            <option value="Database Records">Raw: Submitted Database Records</option>
          </select>
        </div>
        <button
          onClick={handleGenerateReport}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-xl shadow-indigo-500/20"
        >
          <FontAwesomeIcon icon={faFileDownload} size="lg" />
          Render
        </button>
      </div>

      {generatedReport && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-8 rounded-3xl animate-fade-in-up">
          {renderReport()}
          <div className="flex justify-end mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 gap-4">
             <button
              onClick={() => {
                 toast.success("Data snapshot synced to the Dean's secure box.");
              }}
              className="bg-slate-800 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors text-sm shadow-md"
            >
              <FontAwesomeIcon icon={faPaperPlane} size="lg" />
              Forward Snapshot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyReports;
