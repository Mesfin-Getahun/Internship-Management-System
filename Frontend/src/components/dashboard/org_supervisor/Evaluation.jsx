import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChevronRight } from '@fortawesome/free-solid-svg-icons';;

// This would typically come from a context or API call
const mockStudents = [
  { id: '1', name: 'John Doe', universityId: 'BDU12345', department: 'Software Engineering', status: 'Pending' },
  { id: '2', name: 'Jane Smith', universityId: 'BDU67890', department: 'Computer Science', status: 'Completed' },
];

const Evaluation = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Student Evaluations</h2>
          <p className="text-slate-500 text-sm mt-1">Select a student to fill out or review their assessment form.</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {mockStudents.map(student => (
          <Link 
            to={`/org-supervisor/evaluate/${student.id}`} 
            key={student.id}
            className="block bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 p-4 rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
                  <FontAwesomeIcon icon={faUser} className="text-indigo-600 dark:text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">{student.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{student.department} - {student.universityId}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  student.status === 'Completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                }`}>
                  {student.status}
                </span>
                <FontAwesomeIcon icon={faChevronRight} className="text-slate-400 dark:text-slate-500" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Evaluation;
