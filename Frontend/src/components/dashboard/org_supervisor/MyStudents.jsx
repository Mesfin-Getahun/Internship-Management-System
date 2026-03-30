import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChevronRight, faSpinner, faUsersSlash } from '@fortawesome/free-solid-svg-icons';

const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company_mentor/students`, {
           headers: { Authorization: `Bearer ${user?.token}` }
        });
        const data = res.data.students || res.data || [];
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch supervised students:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchStudents();
  }, [user]);

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl min-h-[400px] flex flex-col justify-center animate-fade-in">
      {!loading && (
         <div className="mb-8">
           <h2 className="text-3xl font-extrabold text-white tracking-tight">Active Supervision Roster</h2>
           <p className="text-slate-400 text-sm mt-1 border-b border-slate-800 pb-6">Select a student from your assigned company program to evaluate their performance.</p>
         </div>
      )}
      
      {loading ? (
        <div className="flex flex-col justify-center items-center py-12 text-slate-400">
           <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mb-4 text-emerald-500" />
           <p className="font-bold">Syncing assignment roster...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-12 text-slate-500 text-center">
           <FontAwesomeIcon icon={faUsersSlash} size="3x" className="mb-4 text-slate-700" />
           <p className="font-bold text-lg text-slate-300">No Roster Assignments</p>
           <p className="text-sm mt-1 max-w-sm">You haven't been assigned any active interns by the platform administrator yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {students.map(student => (
            <Link 
              to={`/dashboard/org-supervisor/evaluate/${student.internship_id || student.id || 'default'}_${student.student_id || student.user_id || 'student'}`} 
              key={student.student_id || student.id}
              className="block bg-slate-800/50 hover:bg-slate-700 p-6 rounded-2xl transition-all border border-slate-700 hover:border-slate-600 group shadow-sm hover:shadow-lg"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <FontAwesomeIcon icon={faUser} size="lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">{student.student_name || student.name || 'Assigned Intern'}</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">ID: {student.student_id ? student.student_id.substring(0,8) : 'N/A'} {student.department ? `· ${student.department}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-[10px] bg-slate-900 border border-slate-700 text-slate-400 font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg group-hover:text-emerald-400 group-hover:border-emerald-500/50 transition-colors">Assess</span>
                   <FontAwesomeIcon icon={faChevronRight} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyStudents;
