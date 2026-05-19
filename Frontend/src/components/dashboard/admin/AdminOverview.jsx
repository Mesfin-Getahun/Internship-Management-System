import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  faUsers,
  faChalkboardTeacher,
  faUniversity,
  faBuilding,
  faBriefcase,
  faHourglassHalf,
  faSpinner,
  faPowerOff,
} from "@fortawesome/free-solid-svg-icons";

const AdminOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [monitoring, setMonitoring] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);

  const fetchAdminBoard = async () => {
    const headers = { Authorization: `Bearer ${user?.token}` };
    const [overviewRes, monitoringRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/overview`, {
        headers,
      }),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/monitoring`, {
        headers,
      }),
    ]);

    setOverview(overviewRes.data || null);
    setMonitoring(monitoringRes.data?.monitoring || null);
  };

  useEffect(() => {
    const loadAdminBoard = async () => {
      try {
        setLoading(true);
        await fetchAdminBoard();
      } catch (error) {
        console.error("Failed to load admin overview.", error);
        toast.error("Failed to load admin overview data.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      loadAdminBoard();
    } else {
      setLoading(false);
    }
  }, [user?.token]);

  const handleMaintenanceToggle = async () => {
    if (!user?.token || !monitoring) {
      return;
    }

    try {
      setIsTogglingMaintenance(true);
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/maintenance`,
        { maintenance_mode: !monitoring.maintenance_mode },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      await fetchAdminBoard();
      toast.success(
        `Maintenance mode ${monitoring.maintenance_mode ? "disabled" : "enabled"} successfully.`,
      );
    } catch (error) {
      console.error("Failed to update maintenance mode.", error);
      toast.error(
        error.response?.data?.message || "Failed to update maintenance mode.",
      );
    } finally {
      setIsTogglingMaintenance(false);
    }
  };

  const stats = useMemo(() => {
    const summary = overview?.summary || {};
    return [
      {
        label: "Total Students",
        val: summary.total_students || 0,
        icon: faUsers,
        color: "indigo",
        path: "/admin/users",
      },
      {
        label: "Total Mentors",
        val: summary.total_mentors || 0,
        icon: faChalkboardTeacher,
        color: "blue",
        path: "/admin/users",
      },
      {
        label: "Active Faculties",
        val: summary.total_faculties || 0,
        icon: faUniversity,
        color: "emerald",
        path: "/admin/faculties",
      },
      // { label: 'Organizations', val: summary.total_organizations || 0, icon: faBuilding, color: 'slate', path: '/admin/users' },
      // { label: 'Active Placements', val: summary.active_placements || 0, icon: faBriefcase, color: 'indigo', path: '/admin/monitoring' },
      // { label: 'Pending Orgs', val: summary.pending_organizations || 0, icon: faHourglassHalf, color: 'amber', path: '/admin/logs' }
    ];
  }, [overview]);

  const recentLogs = overview?.recent_logs || [];
  const systemHealth = useMemo(() => {
    const storage = Number(monitoring?.storage_used_percent || 0);
    const cpu = Number(monitoring?.cpu_percent || 0);
    const apiLatency = Number(monitoring?.api_latency_ms || 0);
    const maintenanceMode = Boolean(monitoring?.maintenance_mode);

    return [
      {
        label: "Host",
        value: monitoring?.host_status || "Unknown",
        detail: "Primary application node",
        healthy: monitoring?.host_status === "Online",
      },
      {
        label: "Database",
        value: monitoring?.database_status || "Unknown",
        detail: "MySQL connectivity",
        healthy: monitoring?.database_status === "Connected",
      },
      {
        label: "API Latency",
        value: `${apiLatency}ms`,
        detail: "Estimated response time",
        healthy: apiLatency <= 250,
      },
      {
        label: "Storage",
        value: `${storage}%`,
        detail: "Backup footprint",
        healthy: storage < 85,
      },
      {
        label: "CPU",
        value: `${cpu}%`,
        detail: "Server load",
        healthy: cpu < 85,
      },
      {
        label: "Maintenance",
        value: maintenanceMode ? "Enabled" : "Disabled",
        detail: "Portal access mode",
        healthy: !maintenanceMode,
      },
    ];
  }, [monitoring]);

  if (loading) {
    return (
      <div className="min-h-[320px] flex items-center justify-center text-indigo-600">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <ToastContainer theme="dark" position="bottom-right" />
      <header>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          System Performance Hub
        </h2>
        <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">
          Global control center for BiT Internship Management.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <Link
            to={stat.path}
            key={i}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group block"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
            >
              <FontAwesomeIcon icon={stat.icon} className="h-5 w-5" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">
              {stat.label}
            </p>
            <div className="text-xl font-black text-slate-800">{stat.val}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-5">
          <div>
            <h3 className="font-bold text-slate-800">System Health</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
              Live platform status from the monitoring service
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/monitoring")}
            className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline"
          >
            Open Monitoring
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
          {systemHealth.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                <span className={`h-2.5 w-2.5 rounded-full ${item.healthy ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`}></span>
              </div>
              <p className={`mt-2 text-lg font-black ${item.healthy ? "text-slate-800" : "text-amber-700"}`}>{item.value}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col h-96">
          <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
              User Registration Growth
            </h3>
            <select className="bg-slate-50 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-100 focus:outline-none">
              <option>Last 6 Months</option>
              <option>Yearly</option>
            </select>
          </div>
          <div className="flex-grow flex items-end justify-between px-4 pb-4">
            {/* Chart Visual Placeholder */}
            {[40, 65, 55, 80, 75, 95].map((val, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-4 group"
              >
                <div className="w-3/4 bg-slate-50 rounded-xl relative h-64 flex flex-col justify-end overflow-hidden border border-slate-100">
                  <div className="w-full bg-indigo-500/20 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div
                    className="w-full bg-indigo-600 rounded-t-lg transition-all duration-1000 group-hover:bg-indigo-700"
                    style={{ height: `${val}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Platform Integrity</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              System security level:{" "}
              <span className="text-green-400 font-bold uppercase tracking-widest ml-1">
                Critical Safe
              </span>
            </p>
            <div className="mt-8 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Maintenance Mode
                    </div>
                    <div
                      className={`mt-2 text-sm font-black uppercase tracking-widest ${monitoring?.maintenance_mode ? "text-amber-300" : "text-emerald-300"}`}
                    >
                      {monitoring?.maintenance_mode ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                  <button
                    onClick={handleMaintenanceToggle}
                    disabled={isTogglingMaintenance || !monitoring}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FontAwesomeIcon icon={faPowerOff} />
                    {isTogglingMaintenance
                      ? "Updating..."
                      : monitoring?.maintenance_mode
                        ? "Disable"
                        : "Enable"}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Server Load</span>
                  <span>{monitoring?.cpu_percent ?? 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-700"
                    style={{ width: `${monitoring?.cpu_percent ?? 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Storage Used</span>
                  <span>{monitoring?.storage_used_percent ?? 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-700"
                    style={{
                      width: `${monitoring?.storage_used_percent ?? 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative z-10 pt-10">
            <button
              onClick={() => navigate("/admin/monitoring")}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-black/40"
            >
              Access System Shell
            </button>
          </div>
          {/* SVG Decoration */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-[2000ms]"></div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-[0.2em]">
            Global Activity Monitor
          </h3>
          <button
            onClick={() => navigate("/admin/logs")}
            className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline"
          >
            View Live Stream
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                <th className="p-5">Event Log</th>
                <th className="p-5">User Reference</th>
                <th className="p-5">Auth Role</th>
                <th className="p-5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(recentLogs.length > 0
                ? recentLogs
                : [
                    {
                      action: "No recent system logs recorded yet.",
                      user_id: "-",
                      created_at: new Date().toISOString(),
                    },
                  ]
              ).map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="p-5 font-bold text-slate-700">{row.action}</td>
                  <td className="p-5 text-slate-500 font-medium">
                    {row.user_id || "System"}
                  </td>
                  <td className="p-5">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                      Admin Event
                    </span>
                  </td>
                  <td className="p-5 text-right font-black uppercase text-[10px] text-indigo-600 tracking-tighter">
                    {row.created_at
                      ? new Date(row.created_at).toLocaleDateString()
                      : "Recent"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
