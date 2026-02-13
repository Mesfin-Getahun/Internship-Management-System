
import React, { useState } from 'react';
import ApplicantDetailModal from './ApplicantDetailModal.jsx';

const OrgApplications = () => {
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [applications, setApplications] = useState([
    { id: 1, name: 'Abebe Bikila', faculty: 'Software Engineering', title: 'Web Developer Intern', date: '2023-10-24', status: 'Pending', gpa: '3.85' },
    { id: 2, name: 'Saba Tadesse', faculty: 'Civil Engineering', title: 'Surveying Assistant', date: '2023-10-23', status: 'Approved', gpa: '3.70' },
    { id: 3, name: 'Mulugeta Seraw', faculty: 'Information Systems', title: 'Web Developer Intern', date: '2023-10-22', status: 'Rejected', gpa: '3.92' },
    { id: 4, name: 'Eden Kebede', faculty: 'Electrical Engineering', title: 'IoT Trainee', date: '2023-10-20', status: 'Pending', gpa: '3.65' },
  ]);

  const handleViewDetails = (app) => {
    setSelectedApplicant(app);
    setIsModalOpen(true);
  };

  const handleAction = (status) => {
    if (!selectedApplicant) return;
    
    // Update local state for immediate feedback
    setApplications(prev => prev.map(app => 
      app.id === selectedApplicant.id ? { ...app, status } : app
    ));
    
    // Show confirmation (in real app, this would be an API call)
    console.log(`Application for ${selectedApplicant.name} marked as ${status}`);
    
    setIsModalOpen(false);
    setSelectedApplicant(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">View Applications</h2>
          <p className="text-slate-500 text-sm mt-1">Review student applications and supporting documents.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <select className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Internships</option>
            <option>Web Developer Intern</option>
            <option>IoT Trainee</option>
          </select>
          <select className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Student Name</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Faculty</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Internship Title</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Date</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-center whitespace-nowrap">Status</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="p-5">
                    <div className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">{app.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID/2023/82{app.id}</div>
                  </td>
                  <td className="p-5 text-sm text-slate-600 dark:text-slate-400 font-medium">{app.faculty}</td>
                  <td className="p-5 text-sm text-slate-600 dark:text-slate-400 font-medium">{app.title}</td>
                  <td className="p-5 text-xs text-slate-500 font-bold whitespace-nowrap">{app.date}</td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      app.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      app.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => handleViewDetails(app)}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <ApplicantDetailModal 
        applicant={selectedApplicant}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAction={handleAction}
      />
    </div>
  );
};

export default OrgApplications;
