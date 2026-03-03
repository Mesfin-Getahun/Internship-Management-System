import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Check, X, AlertTriangle, FileDown, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const initialStipends = [
  { id: 1, student: 'John Doe', company: 'Google', amount: 1500, status: 'Pending Approval', submissionDate: '2024-05-20' },
  { id: 2, student: 'Jane Smith', company: 'Microsoft', amount: 1600, status: 'Approved', submissionDate: '2024-05-18' },
  { id: 3, student: 'Peter Jones', company: 'Amazon', amount: 1450, status: 'Pending Approval', submissionDate: '2024-05-21' },
  { id: 4, student: 'Emily White', company: 'Netflix', amount: 1550, status: 'Approved', submissionDate: '2024-05-17' },
  { id: 5, student: 'Michael Brown', company: 'Apple', amount: 1700, status: 'Rejected', submissionDate: '2024-05-19', reason: 'Incorrect banking info' },
  { id: 6, student: 'Sarah Davis', company: 'Facebook', amount: 1500, status: 'Pending Approval', submissionDate: '2024-05-22' },
];

const statusConfig = {
  'Pending Approval': { color: 'amber', icon: AlertTriangle },
  'Approved': { color: 'emerald', icon: Check },
  'Rejected': { color: 'red', icon: X },
};

const FacultyStipendManagement = () => {
  const [stipends, setStipends] = useState(initialStipends);
  const [searchTerm, setSearchTerm] = useState('');

  const handleApproval = (id, newStatus) => {
    setStipends(stipends.map(s => s.id === id ? { ...s, status: newStatus } : s));
    toast.success(`Stipend for student ${id} has been ${newStatus.toLowerCase()}!`);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Student", "Company", "Amount ($)", "Status", "Submission Date"];
    const tableRows = [];

    const approvedStipends = stipends.filter(s => s.status === 'Approved');

    approvedStipends.forEach(stipend => {
      const stipendData = [
        stipend.student,
        stipend.company,
        stipend.amount.toFixed(2),
        stipend.status,
        stipend.submissionDate,
      ];
      tableRows.push(stipendData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text("Approved Student Stipend Report", 14, 15);
    doc.save(`stipend_report_${new Date().toISOString().slice(0,10)}.pdf`);
    toast.info("PDF report generated!");
  };

  const filteredStipends = stipends.filter(s =>
    s.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl">
      <ToastContainer theme="dark" position="bottom-right" />
      <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
        <h2 className="text-3xl font-extrabold text-white">Stipend Management</h2>
        <button
          onClick={generatePDF}
          className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-transform transform hover:scale-105"
        >
          <Printer size={18} />
          Generate Finance Report
        </button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by student or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-800">
            <tr>
              <th scope="col" className="px-6 py-3">Student</th>
              <th scope="col" className="px-6 py-3">Company</th>
              <th scope="col" className="px-6 py-3">Amount</th>
              <th scope="col" className="px-6 py-3">Submission Date</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStipends.map(stipend => {
              const config = statusConfig[stipend.status];
              const Icon = config.icon;
              return (
                <tr key={stipend.id} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="px-6 py-4 font-medium text-white">{stipend.student}</td>
                  <td className="px-6 py-4">{stipend.company}</td>
                  <td className="px-6 py-4">${stipend.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">{stipend.submissionDate}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold bg-${config.color}-900 text-${config.color}-300`}>
                      <Icon size={14} />
                      {stipend.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {stipend.status === 'Pending Approval' ? (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleApproval(stipend.id, 'Approved')} className="font-medium text-emerald-400 hover:text-emerald-300">Approve</button>
                        <button onClick={() => handleApproval(stipend.id, 'Rejected')} className="font-medium text-red-400 hover:text-red-300">Reject</button>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">{stipend.status === 'Rejected' ? stipend.reason : 'N/A'}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyStipendManagement;