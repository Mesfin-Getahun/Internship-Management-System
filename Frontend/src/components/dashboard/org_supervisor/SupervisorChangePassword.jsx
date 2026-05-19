import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../AuthContext";

const SupervisorChangePassword = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.newPassword.length < 8) {
      toast.warn("New password must be at least 8 characters.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.warn("New passwords do not match.");
      return;
    }

    const accountId = user?.company_mentor_id || user?.id;

    if (!accountId) {
      toast.error("Unable to identify your mentor account.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/change-password`, {
        id: accountId,
        role: "company_mentor",
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      login({ ...user, isFirstLogin: false, must_change_password: 0 });
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully.");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to change password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-xl">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Change Password
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Update your company mentor account password.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-5"
      >
        <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
          <FontAwesomeIcon icon={faKey} />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Current Password
          </label>
          <input
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            New Password
          </label>
          <input
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Confirm Password
          </label>
          <input
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-black hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <FontAwesomeIcon icon={submitting ? faSpinner : faKey} spin={submitting} />
          {submitting ? "Updating..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default SupervisorChangePassword;
