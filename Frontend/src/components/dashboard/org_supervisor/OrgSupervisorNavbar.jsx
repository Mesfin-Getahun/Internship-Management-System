import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';

const OrgSupervisorNavbar = () => {
  const { user } = useAuth();
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company_mentor/students`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const students = Array.isArray(res.data?.students) ? res.data.students : [];
        setStudentCount(students.length);
      } catch (error) {
        console.error('Failed to load supervisor navbar data.', error);
      }
    };

    if (user?.token) {
      fetchStudentCount();
    }
  }, [user?.token]);

  const supervisorName = user?.full_name || user?.user?.full_name || 'Supervisor';

  return (
    <nav className="fixed top-0 left-64 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Supervisor Dashboard</h1>
          <p className="text-xs uppercase tracking-widest text-slate-400 mt-1">Company Mentor Workspace</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{supervisorName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{studentCount} assigned student{studentCount === 1 ? '' : 's'}</p>
        </div>
      </div>
    </nav>
  );
};

export default OrgSupervisorNavbar;
