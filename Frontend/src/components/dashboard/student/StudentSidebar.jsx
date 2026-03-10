import React from "react";
import { Link } from "react-router-dom";

import {
  LayoutGrid,
  Search,
  FileText,
  DollarSign,
  Star,
  User,
  Briefcase,
  GitBranch,
  LogOut,
  FileDown,
} from "lucide-react";
import { useAuth } from "../../../AuthContext";

const StudentSidebar = ({ activeTab }) => {
  const { user, logout, isRecommendationAvailable } = useAuth();
  // This mock state determines if the "Internship Status" link is active.
  // 'ACCEPTED' means the student has an offer but hasn't started.
  // 'ACTIVATED' would mean the internship has begun.
  const userState = {
    internshipStatus: "ACTIVATED", // Mock states: 'NONE', 'ACCEPTED', 'ACTIVATED'
  };

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: LayoutGrid },
    { id: "opportunities", label: "Opportunities", icon: Search },
    { id: "my-applications", label: "My Applications", icon: FileText },
  ];

  const processMenuItems = [
    {
      id: "status",
      label: "Internship Status",
      icon: Briefcase,
      disabled: userState.internshipStatus !== "ACTIVATED",
    },
  ];

  const generalMenuItems = [
    { id: "reports", label: "Weekly Reports", icon: FileText },
    { id: "feedback", label: "Feedback", icon: Star },
    { id: "stipend", label: "Stipend Application", icon: DollarSign },
    {
      id: "recommendation",
      label: "Recommendation Letter",
      icon: FileDown,
      disabled: !isRecommendationAvailable,
    },
    { id: "profile", label: "My Profile", icon: User },
  ];

  const SidebarLink = ({ item, activeTab }) => (
    <Link
      to={item.disabled ? "#" : `/student/${item.id}`}
      onClick={(e) => item.disabled && e.preventDefault()}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-all text-sm ${
        item.disabled
          ? "opacity-40 cursor-not-allowed"
          : activeTab === item.id
          ? "bg-blue-600 text-white shadow-md"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );

  return (
    <aside className="h-screen w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col pt-20">
      <div className="flex-grow px-4 mt-4 space-y-1 overflow-y-auto">
        <nav className="flex-1 space-y-1">
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
      </div>
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-all text-sm text-slate-400 hover:bg-red-600 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;
