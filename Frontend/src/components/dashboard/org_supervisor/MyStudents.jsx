import React from 'react';
import { Link } from 'react-router-dom';
import { User, ChevronRight } from 'lucide-react';

const mockStudents = [
  { id: '1', name: 'John Doe', universityId: 'BDU12345', department: 'Software Engineering' },
  { id: '2', name: 'Jane Smith', universityId: 'BDU67890', department: 'Computer Science' },
];

const MyStudents = () => {
  return (
    <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl">
      <h2 className="text-3xl font-extrabold text-white mb-6 border-b border-slate-700 pb-4">My Assigned Students</h2>
      <div className="space-y-4">
        {mockStudents.map(student => (
          <Link 
            to={`/dashboard/org-supervisor/evaluate/${student.id}`} 
            key={student.id}
            className="block bg-slate-800/50 hover:bg-slate-700/50 p-6 rounded-xl transition-all"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500 p-3 rounded-full">
                  <User className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{student.name}</h3>
                  <p className="text-sm text-slate-400">{student.department} - {student.universityId}</p>
                </div>
              </div>
              <ChevronRight className="text-slate-500" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyStudents;
