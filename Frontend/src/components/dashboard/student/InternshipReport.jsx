import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCloudUploadAlt,
  faExternalLinkAlt,
  faFileAlt,
  faPaperPlane,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../AuthContext";

const getReportStatusLabel = (report) => {
  const status = (report?.status || "").toLowerCase();

  if (report?.faculty_submitted_at || status === "faculty_submitted") {
    return "Submitted to Faculty";
  }

  if (report?.mentor_signed_url || status === "signed") {
    return "Signed by Mentor";
  }

  return "Submitted to Mentor";
};

const InternshipReport = () => {
  const { user } = useAuth();
  const [activeInternship, setActiveInternship] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const authConfig = {
    headers: { Authorization: `Bearer ${user?.token}` },
  };

  const loadReports = async () => {
    const [internshipRes, reportsRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/myInternship`, authConfig),
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/reports`, authConfig),
    ]);

    setActiveInternship(internshipRes.data?.internship || null);
    setReports(Array.isArray(reportsRes.data?.reports) ? reportsRes.data.reports : []);
  };

  useEffect(() => {
    const run = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await loadReports();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [user?.token]);

  const currentInternshipReport = activeInternship?.internship_id
    ? reports.find(
        (report) => String(report.internship_id) === String(activeInternship.internship_id),
      )
    : null;
  const hasSubmittedCurrentReport = Boolean(currentInternshipReport);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMessage("");
    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (hasSubmittedCurrentReport) {
      setError("You have already submitted an internship report to your mentor.");
      setSelectedFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF reports are accepted by the backend.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!activeInternship?.internship_id) {
      setError("You need an active internship before uploading reports.");
      return;
    }

    if (hasSubmittedCurrentReport) {
      setError("You have already submitted an internship report to your mentor.");
      return;
    }

    if (!selectedFile) {
      setError("Please choose a PDF report first.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("report", selectedFile);

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/student/uploadReport/${activeInternship.internship_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setSelectedFile(null);
      const input = document.getElementById("report-file");
      if (input) input.value = "";
      await loadReports();
      setMessage("Report uploaded successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload report.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitSignedReport = async (reportId) => {
    try {
      setSubmitting(true);
      setMessage("");
      setError("");

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/student/submitToFaculty/${reportId}`,
        {},
        authConfig,
      );

      await loadReports();
      setMessage("Signed report submitted to faculty.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report to faculty.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-blue-500">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
          Internship Report
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Upload one report PDF for mentor review, then forward the signed report to faculty.
        </p>
      </header>

      {message && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p>}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <h4 className="font-bold text-slate-800 dark:text-white">Report History</h4>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FontAwesomeIcon icon={faFileAlt} size="3x" className="mb-4 text-slate-300" />
              <p className="font-bold">No internship report uploaded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {reports.map((report) => {
                const status = (report.status || "").toLowerCase();
                const isFacultySubmitted = Boolean(report.faculty_submitted_at) || status === "faculty_submitted";
                const isSigned = Boolean(report.mentor_signed_url) || status === "signed";
                const canSubmitToFaculty = isSigned && !isFacultySubmitted;

                return (
                  <div key={report.report_id} className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        {report.internship_title || "Internship Report"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Status: {getReportStatusLabel(report)} - {report.created_at ? new Date(report.created_at).toLocaleDateString() : "Recent"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{report.company_name || "Host organization"}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {report.file_url && (
                        <a href={report.file_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all">
                          <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2" />
                          Original
                        </a>
                      )}
                      {report.mentor_signed_url && (
                        <a href={report.mentor_signed_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all">
                          <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2" />
                          Signed
                        </a>
                      )}
                      {isFacultySubmitted && (
                        <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold">
                          <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                          Submitted to Faculty
                        </span>
                      )}
                      {canSubmitToFaculty && (
                        <button
                          onClick={() => submitSignedReport(report.report_id)}
                          disabled={submitting}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
                        >
                          <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                          Submit to Faculty
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm h-fit">
          <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Submit Internship Report</h4>
          <p className="text-xs text-slate-500 mb-6">
            {hasSubmittedCurrentReport
              ? "Your internship report has already been sent to your mentor."
              : activeInternship
                ? `Active placement: ${activeInternship.title}`
                : "No active internship placement found."}
          </p>

          <form className="space-y-6" onSubmit={handleUpload}>
            <div className={`p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center group transition-colors relative ${
              hasSubmittedCurrentReport ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-blue-400"
            }`}>
              <input
                type="file"
                id="report-file"
                accept="application/pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                disabled={hasSubmittedCurrentReport}
              />
              <FontAwesomeIcon icon={faCloudUploadAlt} className="h-10 w-10 mx-auto text-slate-300 group-hover:text-blue-400 mb-3" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {hasSubmittedCurrentReport
                  ? "Report already submitted"
                  : selectedFile
                    ? selectedFile.name
                    : "Upload PDF report"}
              </p>
            </div>

            <button
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
              disabled={!selectedFile || !activeInternship || hasSubmittedCurrentReport || submitting}
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InternshipReport;
