import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableCellsLarge, faBriefcase, faFileAlt, faAward, faCog, faSignOutAlt, faUsers, faUserTie } from '@fortawesome/free-solid-svg-icons';;
import { useAuth } from "../../../AuthContext";

const base =
  "flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors";

const OrgSidebar = ({ isOpen = false, onClose }) => {
  const { logout } = useAuth();

  const menuItems = [
    { to: "overview", label: "Dashboard", icon: faTableCellsLarge },
    { to: "vacancies", label: "Internship Vacancies", icon: faBriefcase },
    { to: "applications", label: "Applications", icon: faFileAlt },
    { to: "post-internship", label: "Post Internship", icon: faAward },
    { to: "company-mentors", label: "Company Mentors", icon: faUserTie },
    {
      to: "assigned-students",
      label: "Assigned Students",
      icon: faUsers,
    },
    { to: "profile", label: "Profile", icon: faCog },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 z-[70] lg:z-40 transition-transform duration-300 ease-out lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* logo / title */}
      <div className="flex items-center px-6 py-5 border-b border-slate-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 mr-3">
          <FontAwesomeIcon icon={faBriefcase} className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight">
            Organization Portal
          </h1>
          <p className="text-xs text-slate-400">Internship Management</p>
        </div>
      </div>

      <nav className="flex-1 mt-4 px-3 space-y-1">
        {menuItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={`/organization/${to}`}
            end={to === "overview"}
            onClick={onClose}
            className={({ isActive }) =>
              `${base} ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            <FontAwesomeIcon icon={icon} className="h-5 w-5 mr-3" />
            <span className="ml-2">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <button
          onClick={logout}
          className={`${base} w-full text-slate-300 hover:bg-red-600 hover:text-white`}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="h-5 w-5 mr-3" />
          <span className="ml-2">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default OrgSidebar;
