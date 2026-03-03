import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialUnassignedStudents = [
  { name: 'Abebe Bikila', id: 'BIT/102/13', dept: 'Software Eng.' },
  { name: 'Eden Kebede', id: 'BIT/088/13', dept: 'Electrical Eng.' },
  { name: 'Saba Tadesse', id: 'BIT/155/13', dept: 'Civil Eng.' },
  { name: 'Mekdes Hailu', id: 'BIT/215/13', dept: 'Software Eng.' },
  { name: 'Yonas Getachew', id: 'BIT/301/13', dept: 'Software Eng.' },
];

const initialMentors = [
  { id: 1, name: 'Dr. Belayneh', dept: 'Software Eng.', load: 8 },
  { id: 2, name: 'Eng. Solomon', dept: 'Civil Eng.', load: 4 },
  { id: 3, name: 'Dr. Yilma', dept: 'Electrical Eng.', load: 9 },
  { id: 4, name: 'Prof. Martha', dept: 'Chemical Eng.', load: 0 }
];

const FacultyAssignMentors = () => {
  const [unassignedStudents, setUnassignedStudents] = useState(initialUnassignedStudents);
  const [mentors, setMentors] = useState(initialMentors);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssign = (mentorId) => {
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

    // Update mentor's load
    setMentors(prevMentors =>
      prevMentors.map(m =>
        m.id === mentorId ? { ...m, load: newLoad } : m
      )
    );

    // Remove assigned students from the list
    setUnassignedStudents(prevStudents =>
      prevStudents.filter(s => !selectedStudents.includes(s.id))
    );

    // Clear selection
    setSelectedStudents([]);

    toast.success(`${selectedStudents.length} student(s) assigned to ${mentor.name} successfully!`);
  };

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <ToastContainer theme="dark" position="bottom-right" />
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Assign Mentors</h2>
        <p className="text-slate-500 text-sm mt-1">Connect students with academic mentors for technical guidance.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Panel: Students */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="font-bold text-slate-800 dark:text-white">Pending Assignments</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{unassignedStudents.length} Students Needing Mentors</p>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {unassignedStudents.length > 0 ? unassignedStudents.map((s) => (
              <div key={s.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:border-emerald-300 transition-all group cursor-pointer" onClick={() => handleSelectStudent(s.id)}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center font-black text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{s.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{s.dept}</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={selectedStudents.includes(s.id)}
                  readOnly
                  className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500 border-slate-300 pointer-events-none" 
                />
              </div>
            )) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">No students pending assignment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Mentors */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="font-bold text-slate-800 dark:text-white">Available Mentors</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Faculty Supervision Load</p>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {mentors.map((m) => (
              <div key={m.id} className={`p-5 rounded-2xl border transition-all ${
                m.load >= 10 
                  ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 opacity-60' 
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-emerald-500/30'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{m.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{m.dept}</p>
                  </div>
                  <button 
                    onClick={() => handleAssign(m.id)}
                    disabled={m.load >= 10}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      m.load >= 10 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20'
                    }`}
                  >
                    Assign
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400 uppercase">Student Load</span>
                    <span className={m.load >= 9 ? 'text-red-500' : 'text-emerald-500'}>{m.load} / 10</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${m.load >= 9 ? 'bg-red-500' : 'bg-emerald-500'}`} 
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
