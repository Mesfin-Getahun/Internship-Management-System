import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const initialMentors = [
  { id: '1', name: 'Dr. Belayneh', dept: 'Software Eng.', load: 8 },
  { id: '2', name: 'Eng. Solomon', dept: 'Civil Eng.', load: 4 },
  { id: '3', name: 'Dr. Yilma', dept: 'Electrical Eng.', load: 9 },
  { id: '4', name: 'Prof. Martha', dept: 'Chemical Eng.', load: 0 }
];

const FacultyAssignMentors = () => {
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [mentors, setMentors] = useState(initialMentors);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/students`, {
         headers: { Authorization: `Bearer ${user?.token}` }
      });
      const studentsData = res.data.students || res.data || [];
      // Filter out students who already have university_mentor_id or mentor assigned
      const orphans = studentsData.filter(s => !s.university_mentor_id && !s.university_mentor_name);
      setUnassignedStudents(orphans);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchStudents();
  }, [user]);

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssign = async (mentorId) => {
    if (selectedStudents.length === 0) {
      toast.warn('Please select at least one student to assign.');
      return;
    }

    const mentor = mentors.find(m => m.id === mentorId);
    const newLoad = mentor.load + selectedStudents.length;

    if (newLoad > 10) {
      toast.error(`Cannot assign. Mentor ${mentor.name}'s load would exceed the maximum of 10.`);
      return;
    }

    try {
       // Loop through all selected students and post the assignment
       const assignPromises = selectedStudents.map(studentId => 
          axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/assignMentor`, 
            { student_id: studentId, mentor_id: mentorId },
            { headers: { Authorization: `Bearer ${user?.token}` } }
          )
       );
       await Promise.all(assignPromises);
       
       // Update mentor's mock load
       setMentors(prevMentors =>
         prevMentors.map(m =>
           m.id === mentorId ? { ...m, load: newLoad } : m
         )
       );

       toast.success(`${selectedStudents.length} student(s) assigned to ${mentor.name} successfully!`);
       setSelectedStudents([]);
       fetchStudents(); // Refresh from backend to remove them from unassigned
    } catch (err) {
       console.error(err);
       toast.error("An error occurred during assignment.");
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <ToastContainer theme="dark" position="bottom-right" />
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Assign Mentors</h2>
        <p className="text-slate-500 text-sm mt-1">Connect students with academic mentors for technical guidance.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Panel: Students */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[600px] overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="font-bold text-slate-800 dark:text-white">Pending Assignments</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{unassignedStudents.length} Students Needing Mentors</p>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar relative">
            {loading ? (
               <div className="flex justify-center items-center h-full text-indigo-500">
                 <FontAwesomeIcon icon={faSpinner} spin size="2x" />
               </div>
            ) : unassignedStudents.length > 0 ? unassignedStudents.map((s) => {
               const sId = s.student_id || s.id;
               return (
                <div key={sId} className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group cursor-pointer shadow-sm hover:shadow-md" onClick={() => handleSelectStudent(sId)}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all text-lg shadow-sm">
                      {s.first_name ? s.first_name.charAt(0) : (s.name ? s.name.charAt(0) : 'S')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{s.first_name ? `${s.first_name} ${s.last_name}` : s.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{s.department || s.dept || 'Not Specified'}</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={selectedStudents.includes(sId)}
                    readOnly
                    className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-300 pointer-events-none" 
                  />
                </div>
               )
            }) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <p className="font-bold text-slate-600 dark:text-slate-300">All Set!</p>
                <p className="text-xs text-slate-400 mt-1">No students pending academic mentor assignment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Mentors */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[600px] overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="font-bold text-slate-800 dark:text-white">Available Mentors</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Faculty Supervision Load</p>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {mentors.map((m) => (
              <div key={m.id} className={`p-6 rounded-2xl border transition-all shadow-sm ${
                m.load >= 10 
                  ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 opacity-60 grayscale' 
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-indigo-500/30 dark:hover:border-indigo-500/50'
              }`}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-lg">{m.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{m.dept}</p>
                  </div>
                  <button 
                    onClick={() => handleAssign(m.id)}
                    disabled={m.load >= 10 || selectedStudents.length === 0}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 uppercase tracking-wider ${
                      m.load >= 10 || selectedStudents.length === 0
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 shadow-none cursor-not-allowed border border-slate-200 dark:border-slate-700' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20 border border-indigo-600'
                    }`}
                  >
                    Assign
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-400">Student Load</span>
                    <span className={m.load >= 9 ? 'text-rose-500' : 'text-indigo-500'}>{m.load} / 10</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${m.load >= 9 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`} 
                      style={{ width: `${m.load * 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyAssignMentors;
