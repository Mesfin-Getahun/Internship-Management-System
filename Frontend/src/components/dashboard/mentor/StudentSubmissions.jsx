import React, { useState } from 'react';
import { FileText, Download, User } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const mockSubmissions = {
  '1': [
    { id: 'sub1', type: 'Internship Proposal', date: '2024-03-15', file: 'proposal_john_doe.pdf' },
    { id: 'sub2', type: 'Monthly Progress Report - April', date: '2024-04-30', file: 'report_april_john_doe.pdf' },
    { id: 'sub3', type: 'Monthly Progress Report - May', date: '2024-05-31', file: 'report_may_john_doe.pdf' },
    { id: 'sub4', type: 'Final Internship Report', date: '2024-06-20', file: 'final_report_john_doe.pdf' },
  ],
  '2': [
    { id: 'sub5', type: 'Internship Proposal', date: '2024-03-16', file: 'proposal_jane_smith.pdf' },
    { id: 'sub6', type: 'Monthly Progress Report - April', date: '2024-04-29', file: 'report_april_jane_smith.pdf' },
  ],
  '3': [
      // No submissions yet
  ]
};

const mockStudents = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Peter Jones' },
];

const StudentSubmissions = () => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const submissions = selectedStudent ? mockSubmissions[selectedStudent] : [];

  const handleDownload = (fileName) => {
    toast.info(`Simulating download for: ${fileName}`);
    // In a real app, this would trigger a file download.
  };

  return (
    <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl">
      <ToastContainer theme="dark" position="bottom-right" />
      <h2 className="text-3xl font-extrabold text-white mb-6 border-b border-slate-700 pb-4">Student Submissions</h2>

      <div className="mb-6 max-w-sm">
        <label htmlFor="student-select" className="block text-sm font-medium text-slate-300 mb-2">
          Select a Student
        </label>
        <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select
                id="student-select"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500"
            >
                <option value="">-- View Submissions For --</option>
                {mockStudents.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
                ))}
            </select>
        </div>
      </div>

      {selectedStudent ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800">
              <tr>
                <th scope="col" className="px-6 py-3">Document Type</th>
                <th scope="col" className="px-6 py-3">Submission Date</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions && submissions.length > 0 ? (
                submissions.map(sub => (
                  <tr key={sub.id} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                      <FileText size={16} /> {sub.type}
                    </td>
                    <td className="px-6 py-4">{sub.date}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDownload(sub.file)}
                        className="font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-2 mx-auto"
                      >
                        <Download size={16} /> Download
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-slate-800/50 border-b border-slate-700">
                    <td colSpan="3" className="text-center py-8 text-slate-500">
                        No submissions found for this student.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
            <p>Please select a student to view their submitted documents.</p>
        </div>
      )}
    </div>
  );
};

export default StudentSubmissions;