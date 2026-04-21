import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEnvelope,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../AuthContext";

const CompanyInvitation = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.company_name.trim())
      newErrors.company_name = "Company name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      if (!user?.token) {
        setSubmitResult({
          success: false,
          message: "Your session has expired. Please log in again.",
        });
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/UIL/inviteCompany`,
        {
          ...formData,
          frontend_url: window.location.origin,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      );

      setSubmitResult({
        success: true,
        message: "Company invitation sent successfully!",
        inviteUrl: response.data.inviteUrl,
      });

      // Reset form on success
      setFormData({
        company_name: "",
        email: "",
      });
    } catch (error) {
      setSubmitResult({
        success: false,
        message: error.response?.data?.message || "Failed to send invitation",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faPlus} className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Invite New Company</h2>
          </div>
          <p className="text-blue-100 mt-2">
            Send an invitation email to a company to complete their registration
          </p>
        </div>

        <div className="p-8">
          {submitResult && (
            <div
              className={`mb-6 rounded-xl border p-4 flex items-start gap-3 ${
                submitResult.success
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <FontAwesomeIcon
                icon={submitResult.success ? faCheckCircle : faTimesCircle}
                className="h-5 w-5 mt-0.5 shrink-0"
              />
              <div>
                <p className="font-semibold">{submitResult.message}</p>
                {submitResult.inviteUrl && (
                  <p className="text-sm mt-1 opacity-80">
                    Invite link:{" "}
                    <a
                      href={submitResult.inviteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      {submitResult.inviteUrl}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all ${
                    errors.company_name
                      ? "border-red-500 bg-red-50"
                      : "border-slate-300"
                  }`}
                  placeholder="Enter company name"
                />
                {errors.company_name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.company_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all ${
                    errors.email
                      ? "border-red-500 bg-red-50"
                      : "border-slate-300"
                  }`}
                  placeholder="company@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-3 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5" />
                {isSubmitting ? "Sending Invitation..." : "Send Invitation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyInvitation;
