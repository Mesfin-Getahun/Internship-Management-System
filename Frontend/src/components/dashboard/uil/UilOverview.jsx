import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faHourglassHalf,
  faBriefcase,
  faCheckCircle,
  faDownload,
  faGraduationCap,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const getFulfillmentState = (row) => {
  const placementStatus = String(row.placement_status || "").toLowerCase();
  const reportDone = Boolean(row.faculty_submitted_at);
  const evaluationDone = Boolean(row.evaluation_id);
  const completedPlacement = ["completed", "complete"].includes(
    placementStatus,
  );

  return {
    reportDone,
    evaluationDone,
    completedPlacement,
    fulfilled: reportDone && evaluationDone,
  };
};

const getPlacementKey = (row) =>
  row.placement_id ||
  `${row.student_id || "student"}-${row.internship_id || row.internship_title || row.company_name || "placement"}`;

const summarizePlacements = (rows) => {
  const placements = new Map();

  rows.forEach((row) => {
    const key = getPlacementKey(row);
    const state = getFulfillmentState(row);
    const current = placements.get(key) || {
      ...row,
      reportDone: false,
      evaluationDone: false,
      completedPlacement: false,
    };

    current.reportDone = current.reportDone || state.reportDone;
    current.evaluationDone = current.evaluationDone || state.evaluationDone;
    current.completedPlacement =
      current.completedPlacement || state.completedPlacement;
    placements.set(key, current);
  });

  return Array.from(placements.values()).map((placement) => ({
    ...placement,
    fulfilled: placement.reportDone && placement.evaluationDone,
  }));
};

const UilOverview = () => {
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    pendingOrganizations: 0,
    totalInternships: 0,
    pendingInternships: 0,
    completedPlacements: 0,
  });
  const [fulfillmentRows, setFulfillmentRows] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const [
          activeOrgs,
          pendingOrgs,
          allInterns,
          pendingInterns,
          fulfillmentRes,
        ] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/UIL/companies/active`,
            { headers: { Authorization: `Bearer ${user?.token}` } },
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/UIL/companyRequest`,
            { headers: { Authorization: `Bearer ${user?.token}` } },
          ),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/UIL/internships`, {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/UIL/internships/pending`,
            { headers: { Authorization: `Bearer ${user?.token}` } },
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/UIL/fulfillmentReports`,
            { headers: { Authorization: `Bearer ${user?.token}` } },
          ),
        ]);
        const fulfillmentData = Array.isArray(fulfillmentRes.data?.reports)
          ? fulfillmentRes.data.reports
          : [];
        const placementSummaries = summarizePlacements(fulfillmentData);
        const completedPlacements = placementSummaries.filter(
          (placement) => placement.completedPlacement || placement.fulfilled,
        ).length;

        setStats({
          totalOrganizations: activeOrgs.data.count || 0,
          pendingOrganizations: pendingOrgs.data.count || 0,
          totalInternships: allInterns.data.count || 0,
          pendingInternships: pendingInterns.data.internships?.length || 0,
          completedPlacements,
        });
        setFulfillmentRows(fulfillmentData);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchDashboardStats();
  }, [user]);

  const displayStats = [
    {
      label: "Total Organizations",
      val: stats.totalOrganizations,
      icon: faBuilding,
      trend: "Active",
      color: "indigo",
      path: "/uil/approvals",
    },
    {
      label: "Pending Orgs",
      val: stats.pendingOrganizations,
      icon: faHourglassHalf,
      trend: "Requests",
      color: "amber",
      path: "/uil/approvals",
    },
    {
      label: "Total Internships",
      val: stats.totalInternships,
      icon: faBriefcase,
      trend: "All Time",
      color: "blue",
      path: "/uil/internship-approvals",
    },
    {
      label: "Pending Internships",
      val: stats.pendingInternships,
      icon: faCheckCircle,
      trend: "Action Req",
      color: "red",
      path: "/uil/internship-approvals",
    },
    {
      label: "Completed Placements",
      val: stats.completedPlacements,
      icon: faGraduationCap,
      trend: "Semesterly",
      color: "emerald",
      path: "/uil/reports",
    },
  ];

  const facultyDistribution = React.useMemo(() => {
    const grouped = new Map();
    const placements = summarizePlacements(fulfillmentRows);

    placements.forEach((row) => {
      const faculty = row.faculty || "Unassigned";
      const current = grouped.get(faculty) || {
        faculty,
        placements: 0,
        fulfilled: 0,
        completed: 0,
      };

      current.placements += 1;
      if (row.fulfilled) current.fulfilled += 1;
      if (row.completedPlacement || row.fulfilled) current.completed += 1;
      grouped.set(faculty, current);
    });

    const rows = Array.from(grouped.values()).sort(
      (a, b) => b.placements - a.placements,
    );
    const maxPlacements = Math.max(...rows.map((row) => row.placements), 1);

    return rows.map((row) => ({
      ...row,
      placementPercent: Math.round((row.placements / maxPlacements) * 100),
      fulfilledPercent: row.placements
        ? Math.round((row.fulfilled / row.placements) * 100)
        : 0,
    }));
  }, [fulfillmentRows]);

  const handleExportGlobalStats = () => {
    const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["Section", "Metric", "Value"],
      ...displayStats.map((stat) => ["Summary", stat.label, stat.val]),
      [],
      ["Faculty", "Placements", "Fulfilled", "Completed", "Fulfillment Rate"],
      ...facultyDistribution.map((row) => [
        row.faculty,
        row.placements,
        row.fulfilled,
        row.completed,
        `${row.fulfilledPercent}%`,
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `uil-global-stats-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const runAnalytics = () => {
    const placements = summarizePlacements(fulfillmentRows);
    const totalPlacements = placements.length;
    const fulfilled = placements.filter((row) => row.fulfilled).length;
    const reportsSubmitted = placements.filter((row) => row.reportDone).length;
    const evaluationsCompleted = placements.filter(
      (row) => row.evaluationDone,
    ).length;
    const topFaculty = facultyDistribution[0]?.faculty || "No faculty data";

    setAnalytics({
      totalPlacements,
      fulfilled,
      reportsSubmitted,
      evaluationsCompleted,
      fulfillmentRate: totalPlacements
        ? Math.round((fulfilled / totalPlacements) * 100)
        : 0,
      topFaculty,
      generatedAt: new Date(),
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            System Oversight
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Institutional monitoring of university-industry linkages.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportGlobalStats}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-100 transition-all border border-indigo-200/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FontAwesomeIcon icon={faDownload} className="h-3.5 w-3.5" />
            Export Global Stats
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-32 w-full text-indigo-400">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {displayStats.map((stat, i) => (
            <button
              key={i}
              type="button"
              onClick={() => navigate(stat.path)}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-left"
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
              >
                <FontAwesomeIcon icon={stat.icon} className="h-6 w-6" />
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">
                {stat.label}
              </p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-slate-800">
                  {stat.val}
                </span>
                <span
                  className={`text-[10px] font-bold text-${stat.color}-600 px-2 py-0.5 bg-${stat.color}-50 rounded-lg`}
                >
                  {stat.trend}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 h-96 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-800">
              Placement Distribution by Faculty
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span className="text-[10px] font-black uppercase text-slate-400">
                  Placements
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="text-[10px] font-black uppercase text-slate-400">
                  Fulfilled
                </span>
              </div>
            </div>
          </div>
          <div className="flex-grow flex items-end gap-5 px-2 overflow-x-auto">
            {facultyDistribution.length > 0 ? (
              facultyDistribution.slice(0, 8).map((item) => (
                <button
                  type="button"
                  key={item.faculty}
                  onClick={() => navigate("/uil/reports")}
                  className="min-w-20 flex-1 h-full flex flex-col items-center gap-3 group text-left"
                  title={`${item.faculty}: ${item.placements} placements, ${item.fulfilled} fulfilled`}
                >
                  <div className="w-full bg-slate-50 rounded-xl relative h-full flex flex-col justify-end overflow-hidden border border-slate-100">
                    <div
                      className="absolute inset-x-0 bottom-0 bg-indigo-500 transition-all duration-1000 group-hover:bg-indigo-600"
                      style={{ height: `${item.placementPercent}%` }}
                    ></div>
                    <div
                      className="absolute inset-x-2 bottom-0 bg-emerald-400 transition-all duration-1000"
                      style={{ height: `${item.fulfilledPercent}%` }}
                    ></div>
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] font-black text-slate-500 uppercase tracking-tighter h-4 truncate max-w-24">
                      {item.faculty}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      {item.placements} placed
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
                No placement data recorded yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h3 className="font-bold text-slate-800 mb-6">System Health</h3>
            <div className="space-y-6">
              {[
                { label: 'DB Connectivity', status: 'Operational', color: 'green' },
                { label: 'Portal Traffic', status: 'Moderate', color: 'indigo' },
                { label: 'Notification Service', status: 'Operational', color: 'green' }
              ].map((sys, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">{sys.label}</span>
                  <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase text-${sys.color}-600`}>
                    <span className={`w-2 h-2 rounded-full bg-${sys.color}-500 animate-pulse`}></span>
                    {sys.status}
                  </span>
                </div>
              ))}
            </div>
          </div> */}

          <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-2">UIL Report Engine</h4>
              <p className="text-indigo-300 text-xs leading-relaxed mb-6">
                Generate semester-end fulfillment analytics for the university
                board.
              </p>
              {analytics && (
                <div className="mb-5 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-indigo-200 text-[9px] font-black uppercase tracking-widest">
                      Fulfillment
                    </p>
                    <p className="text-2xl font-black">
                      {analytics.fulfillmentRate}%
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-indigo-200 text-[9px] font-black uppercase tracking-widest">
                      Placements
                    </p>
                    <p className="text-2xl font-black">
                      {analytics.totalPlacements}
                    </p>
                  </div>
                  <div className="col-span-2 rounded-2xl bg-white/10 p-3 text-indigo-100">
                    {analytics.fulfilled} fulfilled,{" "}
                    {analytics.reportsSubmitted} reports,{" "}
                    {analytics.evaluationsCompleted} evaluations. Top faculty:{" "}
                    {analytics.topFaculty}.
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={runAnalytics}
                className="w-full py-3 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl shadow-black/20"
              >
                Run Analytics
              </button>
              <button
                type="button"
                onClick={() => navigate("/uil/reports")}
                className="mt-3 w-full py-3 bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95"
              >
                Open Reports
              </button>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UilOverview;
