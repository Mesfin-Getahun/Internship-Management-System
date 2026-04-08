import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableCellsLarge,
  faCheckSquare,
  faDesktop,
  faFileAlt,
  faBell,
  faCog,
  faSignOutAlt,
  faFileUpload,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";

const UilSidebar = ({ activeTab }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: faTableCellsLarge },
    { id: "approvals", label: "Org Approvals", icon: faCheckSquare },
    {
      id: "internship-approvals",
      label: "Internship Approvals",
      icon: faBriefcase,
    },
    { id: "monitoring", label: "Internship Monitoring", icon: faDesktop },
    { id: "reports", label: "Fulfillment Reports", icon: faFileAlt },
    {
      id: "recommendation",
      label: "Recommendation Letter",
      icon: faFileUpload,
    },
    // { id: 'notifications', label: 'Notifications', icon: faBell },
    // { id: "settings", label: "Settings", icon: faCog },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 pt-20 z-40 transition-colors">
      <div className="px-6 py-4 border-b border-slate-800">
        <h2 className="text-white font-black text-xs uppercase tracking-[0.2em] opacity-50">
          University UIL
        </h2>
      </div>
      <nav className="flex-grow px-4 mt-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={`/uil/${item.id}`}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
              activeTab === item.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <FontAwesomeIcon icon={item.icon} className="h-5 w-5 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-400 hover:bg-red-950/20 transition-colors text-sm"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default UilSidebar;
