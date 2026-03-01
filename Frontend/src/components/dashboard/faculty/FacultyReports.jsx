import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FileDown, Send } from 'lucide-react';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const FacultyReports = () => {
  const [reportType, setReportType] = useState('');
  const [generatedReport, setGeneratedReport] = useState(null);

  const handleGenerateReport = () => {
    if (!reportType) {
      toast.error("Please select a report type first.");
      return;
    }
    toast.success(`Successfully generated ${reportType} report!`);
    setGeneratedReport(reportType);
  };

  const handleSend = () => {
    toast.info(`Simulating sending the ${generatedReport} report to the Dean's office...`);
    setTimeout(() => {
        toast.success("Report has been sent successfully!");
    }, 2000);
  };

  const renderReport = () => {
    if (!generatedReport) {
      return <div className="text-center text-slate-500 mt-10">Please generate a report to see the data.</div>;
    }

    switch (generatedReport) {
      case 'Academic Summary':
        return (
          <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4">Academic Internship Summary</h3>
            <p className="mb-6 text-slate-400">This report shows the number of students with and without internships across different departments.</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={academicSummaryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Legend />
                <Bar dataKey="with_internship" stackId="a" fill="#10B981" name="With Internship" />
                <Bar dataKey="without_internship" stackId="a" fill="#F87171" name="Without Internship" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'Internship Completion':
        return (
          <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4">Internship Completion Status</h3>
            <p className="mb-6 text-slate-400">This report provides a snapshot of the current status of all student internships.</p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={completionStatusData} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {completionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl">
      <ToastContainer theme="dark" position="bottom-right" />
      <h2 className="text-3xl font-extrabold text-white mb-6 border-b border-slate-700 pb-4">Reports & Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-slate-800/50 p-6 rounded-xl mb-8">
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="reportType" className="block text-sm font-medium text-slate-300 mb-2">Report Type</label>
          <select
            id="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">-- Select a Report --</option>
            <option value="Academic Summary">Academic Summary</option>
            <option value="Internship Completion">Internship Completion Status</option>
          </select>
        </div>
        <button
          onClick={handleGenerateReport}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-transform transform hover:scale-105"
        >
          <FileDown size={18} />
          Generate Report
        </button>
      </div>

      {generatedReport && (
        <div className="bg-slate-800/50 p-6 rounded-xl">
          {renderReport()}
          <div className="flex justify-end mt-6 gap-4">
             <button
              onClick={handleSend}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-5 rounded-lg flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Send to Dean's Office
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyReports;