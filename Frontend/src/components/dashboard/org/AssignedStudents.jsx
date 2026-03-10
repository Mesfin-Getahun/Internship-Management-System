import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { UserCheck } from 'lucide-react';

// Mock Data
const acceptedStudents = [
  { id: 1, name: 'Abebe Bikila', university: 'Addis Ababa University', department: 'Software Engineering', assignedMentor: null },
  { id: 2, name: 'Fatuma Roba', university: 'Bahir Dar University', department: 'Computer Science', assignedMentor: 'Liya Kebede' },
  { id: 3, name: 'Haile Gebrselassie', university: 'Mekelle University', department: 'Information Systems', assignedMentor: null },
  { id: 4, name: 'Tirunesh Dibaba', university: 'Jimma University', department: 'Software Engineering', assignedMentor: null },
];

const companyMentors = [
  { id: 1, name: 'Liya Kebede' },
  { id: 2, name: 'Marcus Samuelsson' },
  { id: 3, name: 'Eténèsh Wassié' },
];

const AssignedStudents = () => {
  const [students, setStudents] = useState(acceptedStudents);
  const [selectedMentors, setSelectedMentors] = useState({});

  const handleMentorSelect = (studentId, mentorName) => {
    setSelectedMentors(prev => ({
      ...prev,
      [studentId]: mentorName,
    }));
  };

  const handleAssign = (studentId) => {
    const mentorToAssign = selectedMentors[studentId];
    if (!mentorToAssign) {
      toast.warn('Please select a mentor first.');
      return;
    }

    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId
          ? { ...student, assignedMentor: mentorToAssign }
          : student
      )
    );

    toast.success(`${mentorToAssign} has been assigned to the student.`);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Assign Mentors to Students</h2>
        <p className="text-slate-500 text-sm mt-1">Manage and assign company supervisors to accepted interns.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest">Student Name</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest">University</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest">Assigned Mentor</th>
                <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map(student => (
                <tr key={student.id}>
                  <td className="p-5">
                    <p className="font-bold text-slate-800 dark:text-white">{student.name}</p>
                    <p className="text-xs text-slate-500">{student.department}</p>
                  </td>
                  <td className="p-5 text-sm text-slate-600 dark:text-slate-400">{student.university}</td>
                  <td className="p-5">
                    {student.assignedMentor ? (
                      <div className="flex items-center gap-2">
                        <UserCheck size={16} className="text-green-500" />
                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{student.assignedMentor}</span>
                      </div>
                    ) : (
                      <select
                        onChange={(e) => handleMentorSelect(student.id, e.target.value)}
                        className="w-full max-w-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a mentor</option>
                        {companyMentors.map(mentor => (
                          <option key={mentor.id} value={mentor.name}>{mentor.name}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="p-5 text-center">
                    {!student.assignedMentor && (
                      <button
                        onClick={() => handleAssign(student.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
                        disabled={!selectedMentors[student.id]}
                      >
                        Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignedStudents;
