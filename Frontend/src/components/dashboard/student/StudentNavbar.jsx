import React from "react";
import { useAuth } from "../../../AuthContext";
import NotificationBell from "../common/NotificationBell";
import DashboardMenuButton from "../common/DashboardMenuButton";

const StudentNavbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const studentName = user?.full_name || user?.name || "Student";

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 px-4 sm:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <DashboardMenuButton onClick={onMenuClick} />
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-800 dark:text-white leading-none uppercase truncate">
            BiT Student Portal
          </span>
          <div className="hidden sm:flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-black rounded uppercase tracking-wider">
              Role: {user?.role || "Student"}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              BIT Bahir Dar
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell accent="blue" />

        <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">
              {studentName}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">
              {user?.student_id || user?.username || "Student ID"}
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-blue-500/20 overflow-hidden shadow-md group cursor-pointer hover:border-blue-500 transition-colors">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=2563EB&color=fff`}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StudentNavbar;
