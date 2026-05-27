import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableCellsLarge,
  faUsers,
  faUserCheck,
  faUserTie,
  faDesktop,
  faCheckSquare,
  faChartBar,
  faFileAlt,
  faUser,
  faSignOutAlt,
  faKey,
} from "@fortawesome/free-solid-svg-icons";

const FacultySidebar = ({ activeTab, isOpen = false, onClose }) => {
  const menuItems = [
    { id: "overview", label: "Dashboard Overview", icon: faTableCellsLarge },
    { id: "manage-students", label: "Manage Students", icon: faUsers },
    { id: "assign-mentors", label: "Assign Mentors", icon: faUserCheck },
    { id: "presentation-evaluators", label: "Presentation Evaluators", icon: faUserTie },
    { id: "monitor-progress", label: "Monitor Progress", icon: faCheckSquare },
    { id: "org-evaluations", label: "Org Evaluations", icon: faFileAlt },
    { id: "reports", label: "Reports & Stats", icon: faChartBar },
    { id: "stipend-management", label: "Stipend Management", icon: faFileAlt },
    { id: "change-password", label: "Change Password", icon: faKey },
    // { id: 'profile', label: 'Faculty Profile', icon: faUser }
  ];

  return (
    <aside
      className={`w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 pt-20 z-[70] lg:z-40 transition-transform duration-300 ease-out lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <nav className="flex-grow px-4 mt-6 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={`/faculty/${item.id}`}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
              activeTab === item.id
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <FontAwesomeIcon icon={item.icon} className="h-5 w-5 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <Link
          to="/login"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-400 hover:bg-red-950/20 transition-colors text-sm"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="h-5 w-5" />
          Logout
        </Link>
      </div>
    </aside>
  );
};

export default FacultySidebar;
