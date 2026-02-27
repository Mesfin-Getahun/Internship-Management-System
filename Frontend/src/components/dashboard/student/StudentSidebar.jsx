import React from 'react';
import { Link } from 'react-router-dom';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {
  LayoutGrid,
  Search,
  FileText,
  Mail,
  DollarSign,
  Star,
  User,
  Briefcase,
  GitBranch,
} from "lucide-react";

const StudentSidebar = ({ activeTab }) => {
  // In a real app, this would come from a global state (like useAuth)
  const userState = {
    internshipStatus: 'ACTIVATED', // Mock states: 'NONE', 'ACCEPTED', 'ACTIVATED'
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutGrid },
    { id: 'opportunities', label: 'Opportunities', icon: Search },
    { id: 'my-applications', label: 'My Applications', icon: FileText },
    { id: 'requests', label: 'Letter Requests', icon: Mail },
  ];

  const processMenuItems = [
    { id: 'process', label: 'Internship Process', icon: GitBranch, disabled: userState.internshipStatus === 'NONE' },
    { id: 'status', label: 'Internship Status', icon: Briefcase, disabled: userState.internshipStatus !== 'ACTIVATED' },
  ];

  const generalMenuItems = [
    { id: 'reports', label: 'Weekly Reports', icon: FileText },
    { id: 'feedback', label: 'Feedback', icon: Star },
    { id: 'stipend', label: 'Stipend Application', icon: DollarSign },
    { id: 'profile', label: 'My Profile', icon: User },
  ];
  
  const SidebarLink = ({ item, activeTab }) => (
    <Link
      to={item.disabled ? '#' : item.id}
      onClick={(e) => item.disabled && e.preventDefault()}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-all text-sm ${
        item.disabled
          ? 'opacity-40 cursor-not-allowed'
          : activeTab === item.id
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );

  return (
    <aside className="h-screen w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col pt-20">
      <nav className="flex-grow px-4 mt-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <SidebarLink key={item.id} item={item} activeTab={activeTab} />
        ))}
        
        <div className="pt-4">
          <h3 className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            My Internship
          </h3>
          {processMenuItems.map((item) => (
            <SidebarLink key={item.id} item={item} activeTab={activeTab} />
          ))}
        </div>

        <div className="pt-4">
          <h3 className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            General
          </h3>
          {generalMenuItems.map((item) => (
            <SidebarLink key={item.id} item={item} activeTab={activeTab} />
          ))}
        </div>
      </nav>
      {/* Logout button can be placed here */}
    </aside>
  );
};

export default StudentSidebar;
