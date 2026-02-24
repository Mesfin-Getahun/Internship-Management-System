import React from "react";
import { NavLink } from "react-router-dom";

const base =
  "flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors";

const OrgSidebar = () => {
  return (
    <aside className="h-screen w-64 bg-slate-900 text-white flex flex-col">
      {/* logo / title */}
      <div className="flex items-center px-6 py-5 border-b border-slate-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 mr-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7l8-4 8 4-8 4-8-4z" />
            <path d="M4 12l8 4 8-4" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight">
            Organization Portal
          </h1>
          <p className="text-xs text-slate-400">Internship Management</p>
        </div>
      </div>

      <nav className="mt-4 px-3 space-y-1">
        {/* Overview */}
        <NavLink
          to="/dashboard/organization"
          end
          className={({ isActive }) =>
            `${base} ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <span className="ml-2">Dashboard</span>
        </NavLink>

        {/* Vacancies */}
        <NavLink
          to="/dashboard/organization/vacancies"
          className={({ isActive }) =>
            `${base} ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <span className="ml-2">Internship Vacancies</span>
        </NavLink>

        {/* Applications */}
        <NavLink
          to="/dashboard/organization/applications"
          className={({ isActive }) =>
            `${base} ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <span className="ml-2">Applications</span>
        </NavLink>

        {/* Evaluation */}
        <NavLink
          to="/dashboard/organization/evaluation"
          className={({ isActive }) =>
            `${base} ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <span className="ml-2">Evaluation</span>
        </NavLink>

        {/* Supervision */}
        <NavLink
          to="/dashboard/organization/supervision"
          className={({ isActive }) =>
            `${base} ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <span className="ml-2">Supervision</span>
        </NavLink>

        {/* Post Internship */}
        <NavLink
          to="/dashboard/organization/post"
          className={({ isActive }) =>
            `${base} ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <span className="ml-2">Post Internship</span>
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/dashboard/organization/profile"
          className={({ isActive }) =>
            `${base} ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <span className="ml-2">Profile</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default OrgSidebar;
