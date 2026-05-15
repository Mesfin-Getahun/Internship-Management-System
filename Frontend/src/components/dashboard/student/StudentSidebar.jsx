import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableCellsLarge,
  faSearch,
  faFileAlt,
  faDollarSign,
  faStar,
  faUser,
  faBriefcase,
  faCodeBranch,
  faSignOutAlt,
  faFileDownload,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../AuthContext";

const StudentSidebar = ({ activeTab }) => {
  const { user, logout, isRecommendationAvailable } = useAuth();
  const [hasActiveInternship, setHasActiveInternship] = useState(false);

  useEffect(() => {
    const loadPlacementStatus = async () => {
      if (!user?.token) {
        setHasActiveInternship(false);
        return;
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/myInternship`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setHasActiveInternship(Boolean(res.data?.internship));
      } catch {
        setHasActiveInternship(false);
      }
    };

    loadPlacementStatus();
  }, [user?.token]);

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: faTableCellsLarge },
    { id: "opportunities", label: "Opportunities", icon: faSearch },
    { id: "my-applications", label: "My Applications", icon: faFileAlt },
  ];

  const processMenuItems = [
    {
      id: "status",
      label: "Internship Status",
      icon: faBriefcase,
      disabled: !hasActiveInternship,
    },
  ];

  const generalMenuItems = [
    { id: "reports", label: "Internship Report", icon: faFileAlt, disabled: !hasActiveInternship },
    { id: "feedback", label: "Feedback", icon: faStar },
    { id: "stipend", label: "Stipend Application", icon: faDollarSign },
    {
      id: "recommendation",
      label: "Recommendation Letter",
      icon: faFileDownload,
      disabled: !isRecommendationAvailable,
    },
    { id: "profile", label: "My Profile", icon: faUser },
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
      <FontAwesomeIcon icon={item.icon} className="h-5 w-5 shrink-0" />
      <span className="truncate">{item.label}</span>
      {item.id === "recommendation" && isRecommendationAvailable && (
        <span className="ml-auto rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
          New
        </span>
      )}
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
          <FontAwesomeIcon icon={faSignOutAlt} className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;
