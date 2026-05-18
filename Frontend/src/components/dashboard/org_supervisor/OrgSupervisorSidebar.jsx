import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableCellsLarge, faUsers, faFileAlt, faSignOutAlt, faCommentDots, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from "../../../AuthContext";
import axios from "axios";

const OrgSupervisorSidebar = ({ activeTab, isOpen = false, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(null);

  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company_mentor/students`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const students = Array.isArray(res.data?.students) ? res.data.students : [];
        setStudentCount(students.length);
      } catch (error) {
        console.error("Failed to load supervisor students.", error);
        setStudentCount(0);
      }
    };

    if (user?.token) {
      fetchStudentCount();
    } else {
      setStudentCount(0);
    }
  }, [user?.token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: faTableCellsLarge },
    { id: "students", label: "Students", icon: faUsers, badge: studentCount },
    { id: "evaluation", label: "Evaluation", icon: faFileAlt },
    { id: "feedback", label: "Feedback", icon: faCommentDots },
  ];

  return (
    <aside
      className={`w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 pt-20 z-[70] lg:z-40 transition-transform duration-300 ease-out lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="px-6 py-4 border-b border-slate-800">
        <h2 className="text-white font-black text-xs uppercase tracking-[0.2em] opacity-50">
          Org. Supervisor
        </h2>
      </div>
      <nav className="flex-grow px-4 mt-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={`/org-supervisor/${item.id}`}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
              activeTab === item.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <FontAwesomeIcon icon={item.icon} className="h-5 w-5 shrink-0" />
            <span className="truncate">{item.label}</span>
            {item.id === "students" && (
              <span className={`ml-auto min-w-7 h-7 rounded-full text-[10px] font-black flex items-center justify-center ${
                activeTab === item.id ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
              }`}>
                {studentCount === null ? <FontAwesomeIcon icon={faSpinner} spin className="h-3 w-3" /> : studentCount}
              </span>
            )}
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

export default OrgSupervisorSidebar;
