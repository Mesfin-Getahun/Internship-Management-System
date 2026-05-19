import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faKey,
  faPen,
  faPlus,
  faRotate,
  faSpinner,
  faTrash,
  faUserTie,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../AuthContext";

const emptyForm = {
  full_name: "",
  email: "",
  phone_number: "",
  reset_password: false,
};

const buildTemporaryPassword = (email, fullName) =>
  `${String(email || "").trim().toLowerCase()}${String(fullName || "").trim()}`;

const CompanyMentors = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingMentor, setEditingMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");

  const authConfig = useMemo(
    () =>
      user?.token
        ? { headers: { Authorization: `Bearer ${user.token}` } }
        : null,
    [user?.token],
  );

  const fetchMentors = async () => {
    if (!authConfig) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/company/mentors`,
        authConfig,
      );
      setMentors(Array.isArray(res.data?.mentors) ? res.data.mentors : []);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load company mentors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [authConfig]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const startEdit = (mentor) => {
    setEditingMentor(mentor);
    setTemporaryPassword("");
    setFormData({
      full_name: mentor.full_name || "",
      email: mentor.email || "",
      phone_number: mentor.phone_number || "",
      reset_password: false,
    });
  };

  const resetForm = () => {
    setEditingMentor(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!authConfig) return;

    const payload = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone_number: formData.phone_number.trim(),
    };

    if (!payload.full_name || !payload.email) {
      toast.warn("Mentor name and email are required.");
      return;
    }

    try {
      setSubmitting(true);

      if (editingMentor) {
        const shouldResetPassword =
          formData.reset_password || Number(editingMentor.must_change_password) === 1;
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/company/mentors/${editingMentor.company_mentor_id}`,
          { ...payload, reset_password: shouldResetPassword },
          authConfig,
        );

        if (shouldResetPassword) {
          setTemporaryPassword(
            buildTemporaryPassword(payload.email, payload.full_name),
          );
        } else {
          setTemporaryPassword("");
        }

        toast.success("Company mentor updated.");
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/company/mentors`,
          payload,
          authConfig,
        );
        setTemporaryPassword(
          buildTemporaryPassword(payload.email, payload.full_name),
        );
        toast.success("Company mentor added.");
      }

      resetForm();
      await fetchMentors();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save company mentor.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (mentor) => {
    if (!authConfig) return;

    const confirmed = window.confirm(
      `Delete ${mentor.full_name || "this mentor"}? This cannot remove mentors with assigned students or feedback history.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(mentor.company_mentor_id);
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/company/mentors/${mentor.company_mentor_id}`,
        authConfig,
      );
      toast.success("Company mentor deleted.");
      await fetchMentors();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete company mentor.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Company Mentors
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Temporary password: mentor email + mentor full name.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
          <FontAwesomeIcon icon={faKey} />
          First login requires a password change
        </div>
      </header>

      {temporaryPassword && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-200">
          Temporary password:{" "}
          <span className="font-black break-all">{temporaryPassword}</span>
        </div>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 space-y-4 self-start"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-black text-slate-800 dark:text-white">
              {editingMentor ? "Edit Mentor" : "Add Mentor"}
            </h3>
            {editingMentor && (
              <button
                type="button"
                onClick={resetForm}
                className="h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Cancel edit"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Full Name
            </label>
            <input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Phone
            </label>
            <input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {editingMentor && (
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <input
                name="reset_password"
                type="checkbox"
                checked={formData.reset_password}
                onChange={handleChange}
                className="h-4 w-4 accent-blue-600"
              />
              Reset temporary password
            </label>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon
              icon={submitting ? faSpinner : editingMentor ? faRotate : faPlus}
              spin={submitting}
            />
            {submitting ? "Saving..." : editingMentor ? "Update Mentor" : "Add Mentor"}
          </button>
        </form>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[360px]">
          {loading ? (
            <div className="h-80 flex items-center justify-center text-blue-500">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            </div>
          ) : mentors.length === 0 ? (
            <div className="h-80 flex flex-col items-center justify-center text-center text-slate-400 px-4">
              <FontAwesomeIcon icon={faUserTie} size="3x" className="mb-4 opacity-40" />
              <p className="font-bold text-slate-700 dark:text-white">No company mentors yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">Mentor</th>
                    <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">Status</th>
                    <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">Students</th>
                    <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mentors.map((mentor) => {
                    const isDeleting = deletingId === mentor.company_mentor_id;
                    const mustChange = Number(mentor.must_change_password) === 1;

                    return (
                      <tr key={mentor.company_mentor_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                        <td className="p-4 min-w-[260px]">
                          <p className="font-black text-slate-800 dark:text-white">{mentor.full_name || "Unnamed mentor"}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 break-all">{mentor.email || "No email"}</p>
                          <p className="text-xs text-slate-400 mt-1">{mentor.company_mentor_id}</p>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                              mustChange
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                            }`}
                          >
                            {mustChange ? "Password pending" : "Active"}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                          {Number(mentor.assigned_students || 0)}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(mentor)}
                              className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-700 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Edit mentor"
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(mentor)}
                              disabled={isDeleting}
                              className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60"
                              title="Delete mentor"
                            >
                              <FontAwesomeIcon icon={isDeleting ? faSpinner : faTrash} spin={isDeleting} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CompanyMentors;
