import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableCellsLarge,
  faCheckSquare,
  faFileAlt,
  faBell,
  faCog,
  faSignOutAlt,
  faFileUpload,
  faBriefcase,
  faPlus,
  faKey,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

const UilSidebar = ({ activeTab, isOpen = false, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: faTableCellsLarge },
    { id: "company-invitation", label: "Invite Company", icon: faPlus },
    { id: "approvals", label: "Org Approvals", icon: faCheckSquare },
    {
      id: "internship-approvals",
      label: "Internship Management",
      icon: faBriefcase,
    },
    { id: "reports", label: "Fulfillment Reports", icon: faFileAlt },
    { id: "company-ratings", label: "Company Ratings", icon: faStar },
    {
      id: "recommendation",
      label: "Recommendation Letter",
      icon: faFileUpload,
    },
    { id: "change-password", label: "Change Password", icon: faKey },
    // { id: 'notifications', label: 'Notifications', icon: faBell },
    // { id: "settings", label: "Settings", icon: faCog },
  ];

  return (
    <aside
      className={`w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 pt-20 z-[70] lg:z-40 transition-transform duration-300 ease-out lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
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
            onClick={onClose}
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
