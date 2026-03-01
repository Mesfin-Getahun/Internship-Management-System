import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CheckCircle, XCircle, AlertTriangle, Search, ChevronDown, ChevronUp } from 'lucide-react';

const initialStudents = [
  { id: '1', name: 'John Doe', company: 'Google', mentor: 'Dr. Alan Turing', progress: 100, attendance: '98%', evaluation: 'Completed', status: 'Pending Approval' },
  { id: '2', name: 'Jane Smith', company: 'Microsoft', mentor: 'Dr. Grace Hopper', progress: 100, attendance: '95%', evaluation: 'Completed', status: 'Pending Approval' },
  { id: '3', name: 'Peter Jones', company: 'Amazon', mentor: 'Dr. Alan Turing', progress: 85, attendance: '99%', evaluation: 'Pending', status: 'In Progress' },
  { id: '4', name: 'Emily White', company: 'Netflix', mentor: 'Dr. Grace Hopper', progress: 100, attendance: '92%', evaluation: 'Completed', status: 'Approved' },
  { id: '5', name: 'Michael Brown', company: 'Apple', mentor: 'Dr. Alan Turing', progress: 100, attendance: '85%', evaluation: 'Completed', status: 'Rejected' },
  { id: '6', name: 'Sarah Davis', company: 'Facebook', mentor: 'Dr. Grace Hopper', progress: 95, attendance: '96%', evaluation: 'Pending', status: 'In Progress' },
];

const statusConfig = {
  'Pending Approval': { color: 'amber', icon: AlertTriangle },
  'In Progress': { color: 'sky', icon: null },
  'Approved': { color: 'emerald', icon: CheckCircle },
  'Rejected': { color: 'red', icon: XCircle },
};

const FacultyMonitorProgress = () => {
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  const handleStatusChange = (id, newStatus) => {
    setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s));
    toast.success(`Student status updated to ${newStatus}!`);
  };

  const sortedStudents = React.useMemo(() => {
    let sortableItems = [...students];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [students, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredStudents = sortedStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl">
      <ToastContainer theme="dark" position="bottom-right" />
      <h2 className="text-3xl font-extrabold text-white mb-6 border-b border-slate-700 pb-4">Monitor Student Progress & Completion</h2>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by student name or company..."
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
              {['name', 'company', 'mentor', 'progress', 'attendance', 'evaluation', 'status'].map(key => (
                <th key={key} scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort(key)}>
                  <div className="flex items-center gap-1">
                    {key.replace('_', ' ')}
                    {getSortIcon(key)}
                  </div>
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => {
              const config = statusConfig[student.status];
              const Icon = config.icon;
              return (
                <tr key={student.id} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="px-6 py-4 font-medium text-white">{student.name}</td>
                  <td className="px-6 py-4">{student.company}</td>
                  <td className="px-6 py-4">{student.mentor}</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                      <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${student.progress}%` }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{student.attendance}</td>
                  <td className="px-6 py-4">{student.evaluation}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold bg-${config.color}-900 text-${config.color}-300`}>
                      {Icon && <Icon size={14} />}
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {student.status === 'Pending Approval' ? (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleStatusChange(student.id, 'Approved')} className="font-medium text-emerald-400 hover:text-emerald-300">Approve</button>
                        <button onClick={() => handleStatusChange(student.id, 'Rejected')} className="font-medium text-red-400 hover:text-red-300">Reject</button>
                      </div>
                    ) : (
                      <span className="text-slate-500">N/A</span>
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

export default FacultyMonitorProgress;