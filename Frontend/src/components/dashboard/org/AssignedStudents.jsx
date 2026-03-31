import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCheck, faSpinner, faUsersSlash } from '@fortawesome/free-solid-svg-icons';

// Mock company mentors since there's no explicit backend route to fetch them yet
const companyMentors = [
  { id: '1', name: 'Liya Kebede' },
  { id: '2', name: 'Marcus Samuelsson' },
  { id: '3', name: 'Eténèsh Wassié' },
];

const AssignedStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentors, setSelectedMentors] = useState({});
  const { user } = useAuth();

  const fetchAcceptedStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company/getApplications`, {
         headers: { Authorization: `Bearer ${user?.token}` }
      });
      const applications = res.data.applications || res.data || [];
      // Filter only accepted/approved students to manifest in this view
      const activePlacements = applications.filter(app => app.status === 'Accepted' || app.status === 'Approved' || app.status === 'Active');
      setStudents(activePlacements);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load placed students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchAcceptedStudents();
  }, [user]);

  const handleMentorSelect = (studentId, mentorId) => {
    setSelectedMentors(prev => ({
      ...prev,
      [studentId]: mentorId,
    }));
  };

  const handleAssign = async (studentId) => {
    const mentorIdToAssign = selectedMentors[studentId];
    if (!mentorIdToAssign) {
      toast.warn('Please select a mentor first.');
      return;
    }

    try {
      // API expects { student_id, mentor_id }
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/company/assignMentor`, 
      {
         student_id: studentId,
         mentor_id: mentorIdToAssign
      }, 
      {
         headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      const mentorObj = companyMentors.find(m => m.id === mentorIdToAssign);
      toast.success(`${mentorObj?.name || 'Mentor'} has been assigned to the student.`);
      
      // Update local state cosmetically or refetch
      setStudents(prevStudents =>
         prevStudents.map(student =>
           (student.student_id || student.id) === studentId
             ? { ...student, company_mentor_id: mentorIdToAssign, company_mentor_name: mentorObj?.name }
             : student
         )
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to assign mentor. Please try again.');
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Assign Mentors to Students</h2>
        <p className="text-slate-500 text-sm mt-1">Manage and assign company supervisors to accepted interns.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[300px]">
        {loading ? (
           <div className="flex justify-center items-center h-64 text-blue-500">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
           </div>
        ) : students.length === 0 ? (
           <div className="flex flex-col justify-center items-center h-64 text-slate-400">
              <FontAwesomeIcon icon={faUsersSlash} size="3x" className="mb-4 opacity-50 text-slate-300" />
              <p className="font-bold text-lg text-slate-700 dark:text-white">No active students in your organization.</p>
              <p className="text-sm mt-1">Approve applications in the Review Applications tab to place them here.</p>
           </div>
        ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50 dark:bg-slate-800/50">
                 <tr>
                   <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">Student Name</th>
                   <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">Faculty</th>
                   <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">Assigned Mentor</th>
                   <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-center border-b border-slate-100 dark:border-slate-800">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                 {students.map(student => {
                   const sId = student.student_id || student.id;
                   const isAssigned = student.company_mentor_id || student.assignedMentor;
                   return (
                     <tr key={sId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                       <td className="p-6 border-r border-slate-50 dark:border-slate-800/50 max-w-[200px]">
                         <p className="font-bold text-slate-800 dark:text-white truncate" title={student.student_name || student.name}>{student.student_name || student.name || 'Anonymous Student'}</p>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 truncate" title={student.title || student.internship_title}>{student.title || student.internship_title || 'Intern'}</p>
                       </td>
                       <td className="p-6 text-sm text-slate-600 dark:text-slate-400 font-semibold border-r border-slate-50 dark:border-slate-800/50">
                          {student.faculty || student.department || 'Not Specified'}
                       </td>
                       <td className="p-6">
                         {isAssigned ? (
                           <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/10 px-4 py-2.5 rounded-xl border border-green-100/50 dark:border-green-900/30 inline-flex">
                             <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                                <FontAwesomeIcon icon={faUserCheck} size="sm" />
                             </div>
                             <span className="font-bold text-sm text-green-700 dark:text-green-400">
                                {student.company_mentor_name || student.assignedMentor || 'Assigned'}
                             </span>
                           </div>
                         ) : (
                           <select
                             onChange={(e) => handleMentorSelect(sId, e.target.value)}
                             className="w-full max-w-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm appearance-none cursor-pointer"
                           >
                             <option value="">Choose organizational mentor...</option>
                             {companyMentors.map(mentor => (
                               <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
                             ))}
                           </select>
                         )}
                       </td>
                       <td className="p-6 text-center">
                         {!isAssigned && (
                           <button
                             onClick={() => handleAssign(sId)}
                             className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 active:scale-95 uppercase tracking-wider"
                             disabled={!selectedMentors[sId]}
                           >
                             Finalize
                           </button>
                         )}
                       </td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
           </div>
        )}
      </div>
    </div>
  );
};

export default AssignedStudents;
