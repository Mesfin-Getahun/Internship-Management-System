import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBell } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../AuthContext";
import { useNavigate } from "react-router-dom";

const UilNavbar = ({ title }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const routeMap = useMemo(
    () => [
      { keywords: ["dashboard", "overview", "home"], path: "/uil/dashboard" },
      { keywords: ["org", "organization", "approval", "approvals"], path: "/uil/approvals" },
      { keywords: ["internship", "placement"], path: "/uil/internship-approvals" },
      { keywords: ["monitor", "tracking"], path: "/uil/monitoring" },
      { keywords: ["report", "reports"], path: "/uil/reports" },
      { keywords: ["recommendation", "letter"], path: "/uil/recommendation" },
      { keywords: ["notification", "notifications", "message"], path: "/uil/notifications" },
      { keywords: ["setting", "settings"], path: "/uil/settings" },
    ],
    []
  );

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchValue.trim().toLowerCase();
    if (!query) return;

    const match = routeMap.find((entry) =>
      entry.keywords.some((keyword) => query.includes(keyword))
    );

    if (match) {
      navigate(match.path);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-8 flex items-center justify-between transition-colors ml-64">
      <div className="flex items-center gap-8 flex-grow">
        <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">
          {title}
        </h1>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md hidden md:block">
          <FontAwesomeIcon
            icon={faSearch}
            className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            type="text"
            placeholder="Search organizations, students, or reports..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </form>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <button className="relative p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors group">
          <FontAwesomeIcon icon={faBell} className="h-6 w-6" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white group-hover:scale-125 transition-transform"></span>
        </button>

        <div className="h-10 w-px bg-slate-200 mx-2"></div>

        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">
              {user.full_name}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">
              UIL Lead Coordinator
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-indigo-100 border-2 border-indigo-500/20 overflow-hidden shadow-sm group-hover:border-indigo-500 transition-all">
            <img
              src="https://ui-avatars.com/api/?name=UIL+Officer&background=4F46E5&color=fff"
              alt="UIL Officer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UilNavbar;
