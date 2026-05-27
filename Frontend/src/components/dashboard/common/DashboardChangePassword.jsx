import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../AuthContext";

const roleDescriptions = {
  student: "Update your student account password.",
  admin: "Update your administrator account password.",
  faculty: "Update your faculty account password.",
  mentor: "Update your faculty mentor account password.",
  organization: "Update your organization account password.",
  uil: "Update your UIL account password.",
  org_supervisor: "Update your company mentor account password.",
  evaluator: "Update your presentation evaluator account password.",
};

const getBackendRole = (role) => {
  switch (role) {
    case "organization":
      return "company";
    case "org_supervisor":
      return "company_mentor";
    case "evaluator":
      return "evaluator";
    case "uil":
      return "UIL";
    default:
      return role;
  }
};

const getAnyAvailableId = (user, ...keys) => {
  for (const key of keys) {
    const value = user?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return null;
};

const getUserId = (user) => {
  switch (user?.role) {
    case "student":
      return getAnyAvailableId(user, "student_id", "id");
    case "admin":
      return getAnyAvailableId(user, "admin_id", "id");
    case "faculty":
      return getAnyAvailableId(user, "faculty_id", "id");
    case "mentor":
      return getAnyAvailableId(user, "mentor_id", "id");
    case "organization":
      return getAnyAvailableId(user, "company_id", "id");
    case "uil":
      return getAnyAvailableId(user, "UIL_id", "uil_id", "id");
    case "org_supervisor":
      return getAnyAvailableId(user, "company_mentor_id", "id");
    case "evaluator":
      return getAnyAvailableId(user, "evaluator_id", "id");
    default:
      return getAnyAvailableId(
        user,
        "student_id",
        "admin_id",
        "faculty_id",
        "mentor_id",
        "company_id",
        "UIL_id",
        "uil_id",
        "company_mentor_id",
        "evaluator_id",
        "id",
      );
  }
};

const DashboardChangePassword = ({ description }) => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const canUseForgotPassword = ["organization", "company", "org_supervisor", "company_mentor", "admin"].includes(user?.role);

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

    const id = getUserId(user);
    const role = getBackendRole(user?.role);

    if (!id || !role) {
      toast.error("Unable to identify your account. Please sign in again.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/change-password`,
        {
          id,
          role,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: user?.token
            ? { Authorization: `Bearer ${user.token}` }
            : undefined,
        },
      );

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

  const handleForgotPassword = async () => {
    const id = getUserId(user);
    const role = getBackendRole(user?.role);
    const identifier = user?.email || id;

    if (!identifier || !role || !canUseForgotPassword) {
      toast.error("Forgot password is not available for this account.");
      return;
    }

    try {
      setResetSubmitting(true);
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/change-password/forgot`, {
        role,
        identifier,
      });
      const tempPassword = res.data?.temporary_password;
      toast.success(
        tempPassword
          ? `${res.data?.message || "Temporary password generated."} Temporary password: ${tempPassword}`
          : res.data?.message || "Temporary password sent to your email.",
      );
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-xl">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Change Password
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {description || roleDescriptions[user?.role] || "Update your account password."}
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

        {canUseForgotPassword && (
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetSubmitting}
            className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {resetSubmitting ? "Sending temporary password..." : "Forgot current password?"}
          </button>
        )}
      </form>
    </div>
  );
};

export default DashboardChangePassword;
