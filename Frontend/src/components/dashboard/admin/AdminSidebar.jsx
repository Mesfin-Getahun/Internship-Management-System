import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, University, ShieldCheck, DatabaseBackup, History, LogOut } from 'lucide-react';
import { useAuth } from '../../../AuthContext';

const AdminSidebar = ({ activeTab }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutGrid },
    { id: 'faculties', label: 'Manage Faculties', icon: University },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
    { id: 'data-backup', label: 'Data & Backup', icon: DatabaseBackup },
    { id: 'logs', label: 'Audit Logs', icon: History },
    { id: 'monitoring', label: 'Platform Monitoring', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826 3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 pt-20 z-40 transition-colors">
      <div className="px-6 py-4 border-b border-slate-800 mb-4">
        <h2 className="text-white font-black text-xs uppercase tracking-[0.2em] opacity-50">System Root</h2>
      </div>
      <nav className="flex-grow px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map(item => (
          <Link
            key={item.id}
            to={`/admin/${item.id}`}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {typeof item.icon === 'string' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
            ) : (
              <item.icon className="h-5 w-5 shrink-0" />
            )}
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 mt-auto border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-400 hover:bg-red-950/20 transition-colors text-sm"
        >
          <LogOut className="h-5 w-5" />
          Root Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
