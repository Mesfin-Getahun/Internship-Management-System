
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Users, UserCheck, Monitor, CheckSquare, BarChart2, FileText, User, LogOut } from 'lucide-react';

const FacultySidebar = ({ activeTab }) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutGrid },
    { id: 'manage-students', label: 'Manage Students', icon: Users },
    { id: 'assign-mentors', label: 'Assign Mentors', icon: UserCheck },
    { id: 'monitor-progress', label: 'Monitor Progress', icon: BarChart2 },
    { id: 'org-evaluations', label: 'Org Evaluations', icon: FileText },
    { id: 'reports', label: 'Reports & Stats', icon: BarChart2 },
    { id: 'stipend-management', label: 'Stipend Management', icon: FileText },
    { id: 'profile', label: 'Faculty Profile', icon: User }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 pt-20 z-40">
      <nav className="flex-grow px-4 mt-6 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map(item => (
          <Link
            key={item.id}
            to={`/faculty/${item.id}`}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
              activeTab === item.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 mt-auto border-t border-slate-800">
        <Link to="/login" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-400 hover:bg-red-950/20 transition-colors text-sm">
          <LogOut className="h-5 w-5" />
          Logout
        </Link>
      </div>
    </aside>
  );
};

export default FacultySidebar;
