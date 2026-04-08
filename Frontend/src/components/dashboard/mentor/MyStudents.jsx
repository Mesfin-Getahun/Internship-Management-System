import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faUsersSlash } from '@fortawesome/free-solid-svg-icons';

const MyStudents = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mentor/students`, {
           headers: { Authorization: `Bearer ${user?.token}` }
        });
        const data = res.data.students || res.data || [];
        setStudents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchStudents();
  }, [user]);

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">My Assigned Students</h2>
          <p className="text-slate-500 text-sm mt-1">Direct academic supervision list for the current active semester.</p>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
               Total Supervised: {students.length}
           </span>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm min-h-[300px]">
        {loading ? (
           <div className="flex justify-center items-center h-64 text-teal-500">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
           </div>
        ) : students.length === 0 ? (
           <div className="flex flex-col justify-center items-center h-64 text-slate-400">
              <FontAwesomeIcon icon={faUsersSlash} size="3x" className="mb-4 opacity-50" />
              <p className="font-bold text-lg text-slate-700 dark:text-white">No students assigned.</p>
              <p className="text-sm mt-1">Faculty hasn't assigned you any students for supervision yet.</p>
           </div>
        ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/50">
                   <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Student Information</th>
                   <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Organization</th>
                   <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Status</th>
                   <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right whitespace-nowrap">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                 {students.map((student, i) => (
                   <tr key={student.student_id || student.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                     <td className="p-5">
                       <div className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{student.student_name || student.full_name || student.name || 'Student'}</div>
                       <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {student.student_id ? String(student.student_id).slice(0, 8) : 'N/A'} • {student.department || student.faculty || 'Engineering'}</div>
                     </td>
                     <td className="p-5 text-sm text-slate-600 dark:text-slate-400 font-semibold">{student.company_name || student.org || 'Unassigned'}</td>
                     <td className="p-5">
                       {(() => {
                         const status = (student.status || '').toLowerCase();
                         const statusLabel = student.status || 'Active';
                         return (
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                         status === 'active' || status === 'on track' || status === 'in progress' ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50' :
                         status === 'delayed' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50' :
                         'bg-slate-50 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                       }`}>
                         {statusLabel}
                       </span>
                         );
                       })()}
                     </td>
                     <td className="p-5 text-right">
                       <button 
                         onClick={() => setSelectedStudent(student)}
                         className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95"
                       >
                         Profile
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
      </div>

      {/* Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-slate-200 dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-teal-600/30">
                  {selectedStudent.student_name ? selectedStudent.student_name.charAt(0) : (selectedStudent.name ? selectedStudent.name.charAt(0) : 'S')}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-none mb-2">{selectedStudent.student_name || selectedStudent.name}</h3>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md text-slate-500 font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">{selectedStudent.student_id ? String(selectedStudent.student_id).slice(0, 8) : 'N/A'}</span>
                  <p className="text-[10px] text-teal-600 dark:text-teal-400 font-black mt-2 uppercase tracking-widest">{selectedStudent.department || selectedStudent.faculty || 'Engineering'} Student</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-white dark:bg-slate-800 rounded-full shadow-sm">
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Organization</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedStudent.company_name || selectedStudent.org || 'Unassigned'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Internship Role</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedStudent.internship_title || 'Intern'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Supervision Type</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Academic Guidance</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Academic Status</p>
                  <p className="text-sm font-bold text-teal-600">{selectedStudent.status || 'Active'}</p>
                </div>
              </div>
            </div>

            <div className="p-8 pt-0 flex gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
               {/* Non-functional mock buttons for UI completeness */}
              <button className="flex-1 py-4 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm shadow-sm">
                View Academic Transcripts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyStudents;

