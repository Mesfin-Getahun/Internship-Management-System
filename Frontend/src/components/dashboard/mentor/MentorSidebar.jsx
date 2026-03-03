import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Users, ClipboardList, FileCheck, MessageSquare, LogOut, Building } from 'lucide-react';

const MentorSidebar = ({ activeTab }) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutGrid },
    { id: 'my-students', label: 'My Assigned Students', icon: Users },
    { id: 'progress-tracker', label: 'Monitor Progress', icon: ClipboardList },
    { id: 'student-submissions', label: 'Student Submissions', icon: FileCheck },
    { id: 'organization-updates', label: 'Organization Updates', icon: Building },
    { id: 'evaluation', label: 'Evaluation', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen fixed left-0 top-0 pt-20 z-40 transition-colors">
      <nav className="flex-grow px-4 mt-6 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map(item => (
          <Link
            key={item.id}
            to={`/mentor/${item.id}`}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
              activeTab === item.id 
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800">
        <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </Link>
      </div>
    </aside>
  );
};

export default MentorSidebar;
