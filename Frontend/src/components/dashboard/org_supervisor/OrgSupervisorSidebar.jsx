import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutGrid, Users, LogOut } from "lucide-react";
import { useAuth } from "../../../AuthContext";

const base = "flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors";

const OrgSupervisorSidebar = () => {
  const { logout } = useAuth();

  const menuItems = [
    { to: "", label: "Dashboard", icon: LayoutGrid },
    { to: "my-students", label: "My Students", icon: Users },
  ];

  return (
    <aside className="h-screen w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800">
      <div className="flex items-center px-6 py-5 border-b border-slate-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-green-500/10 text-green-400 mr-3">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight">
            Supervisor Portal
          </h1>
          <p className="text-xs text-slate-400">Student Management</p>
        </div>
      </div>

      <nav className="flex-1 mt-4 px-3 space-y-1">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={`/organization-supervisor-dashboard/${to}`}
            end={to === ""}
            className={({ isActive }) =>
              `${base} ${
                isActive
                  ? "bg-green-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            <Icon className="h-5 w-5 mr-3" />
            <span className="ml-2">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <button
          onClick={logout}
          className={`${base} w-full text-slate-300 hover:bg-red-600 hover:text-white`}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className="ml-2">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default OrgSupervisorSidebar;
