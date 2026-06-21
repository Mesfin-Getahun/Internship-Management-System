import React, { useState } from "react";
import SignUpProgressBar from "../../components/signup/SignUpProgressBar";
import OrgInfoStep from "../../components/signup/OrgInfoStep";
import DocumentUploadStep from "../../components/signup/DocumentUploadStep";
import SignUpSuccess from "../../components/signup/SignUpSuccess";
import axios from "axios";
import { isImageFile, isPdfFile } from "../../utils/fileValidation";

const validateDocuments = (formData) => {
  const newErrors = {};

  if (!formData.licenseFile) newErrors.licenseFile = "Business license is required";
  else if (!isPdfFile(formData.licenseFile)) {
    newErrors.licenseFile = "Business license must be a PDF file";
  }
  if (formData.profileFile && !isImageFile(formData.profileFile)) {
    newErrors.profileFile = "Company profile must be an image file";
  }
  if (!formData.agreed) newErrors.agreed = "You must agree to the terms";

  return newErrors;
};

const OtpConfirmationStep = ({
  email,
  otpCode,
  setOtpCode,
  errors,
  otpMessage,
  isRequestingOtp,
  onResendOtp,
}) => (
  <div className="space-y-6 animate-fade-in">
    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
      We sent a 6-digit OTP to <span className="font-semibold">{email}</span>.
    </div>

    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Email OTP
      </label>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={otpCode}
        onChange={(event) =>
          setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))
        }
        className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all tracking-[0.35em] text-center text-xl font-semibold ${
          errors.otp ? "border-red-500 bg-red-50" : "border-slate-300"
        }`}
        placeholder="000000"
      />
      {errors.otp && <p className="mt-1 text-xs text-red-500">{errors.otp}</p>}
    </div>

    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {otpMessage && (
        <p className="text-sm font-medium text-green-700">{otpMessage}</p>
      )}
      <button
        type="button"
        onClick={onResendOtp}
        disabled={isRequestingOtp}
        className="inline-flex items-center justify-center rounded-lg border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRequestingOtp ? "Sending..." : "Resend OTP"}
      </button>
    </div>
  </div>
);

const OrganizationSignUp = () => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    orgName: "",
    orgType: "",
    industry: "",
    website: "",
    orgEmail: "",
    orgPhone: "",
    address: "",
    city: "",
    region: "",
    password: "",
    confirmPassword: "",
    licenseFile: null,
    profileFile: null,
    agreed: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpMessage, setOtpMessage] = useState("");

  const updateFormData = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    const field = Object.keys(data)[0];
    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.orgName)
        newErrors.orgName = "Organization name is required";
      if (!formData.orgEmail) newErrors.orgEmail = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.orgEmail))
        newErrors.orgEmail = "Invalid email format";
      if (!formData.orgPhone) newErrors.orgPhone = "Phone is required";
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 8)
        newErrors.password = "Min 8 characters";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    } else if (step === 2) {
      Object.assign(newErrors, validateDocuments(formData));
    } else if (step === 3) {
      if (!/^\d{6}$/.test(otpCode)) {
        newErrors.otp = "Enter the 6-digit OTP sent to your email";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((prev) => prev + 1);
  };
  const handleBack = () => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next.submit;
      return next;
    });
    setStep((prev) => prev - 1);
  };

  const requestOtp = async ({ isResend = false } = {}) => {
    if (isRequestingOtp) return;

    const documentErrors = validateDocuments(formData);
    if (Object.keys(documentErrors).length > 0) {
      setErrors(documentErrors);
      if (step !== 2) setStep(2);
      return;
    }

    try {
      setIsRequestingOtp(true);
      setOtpMessage("");
      setErrors((prev) => {
        const next = { ...prev };
        delete next.submit;
        delete next.otp;
        return next;
      });

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/company/register/request-otp`,
        {
          orgName: formData.orgName,
          orgEmail: formData.orgEmail,
        }
      );

      const expiry = response.data?.expires_in_minutes;
      setOtpMessage(
        expiry
          ? `${isResend ? "New OTP sent" : "OTP sent"}. It expires in ${expiry} minutes.`
          : `${isResend ? "New OTP sent" : "OTP sent"} to your organization email.`
      );
      setOtpCode("");
      setStep(3);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit:
          error.response?.data?.message ||
          "Failed to send OTP. Please try again.",
      }));
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    try {
      e?.preventDefault?.();

      if (isSubmitting) return;

      if (step !== 3) return;

      if (validateStep()) {
        setIsSubmitting(true);

        const formDataToSend = new FormData();

        formDataToSend.append("orgName", formData.orgName);
        formDataToSend.append("orgType", formData.orgType);
        formDataToSend.append("industry", formData.industry);
        formDataToSend.append("website", formData.website);
        formDataToSend.append("orgEmail", formData.orgEmail);
        formDataToSend.append("orgPhone", formData.orgPhone);
        formDataToSend.append("address", formData.address);
        formDataToSend.append("city", formData.city);
        formDataToSend.append("region", formData.region);
        formDataToSend.append("password", formData.password);
        formDataToSend.append("confirmPassword", formData.confirmPassword);
        formDataToSend.append("agreed", formData.agreed);
        formDataToSend.append("otp", otpCode);

        if (formData.profileFile) {
          formDataToSend.append("profileFile", formData.profileFile);
        }

        if (formData.licenseFile) {
          formDataToSend.append("licenseFile", formData.licenseFile);
        }

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/company/register`,
          formDataToSend
        );

        console.log(response.data);
        setIsSubmitted(true);
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
      setErrors((prev) => ({
        ...prev,
        submit: error.response?.data?.message || "Registration failed. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted)
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-10">
          <SignUpSuccess />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f4f7fb] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-blue-900 px-8 py-10 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Organization Registration
            </h1>
            <p className="text-blue-100 opacity-90">
              Register your organization to offer internships. Your request will
              be confirmed by email before UIL review.
            </p>
          </div>
          <div className="p-8 md:p-12">
            <SignUpProgressBar currentStep={step} totalSteps={3} />
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <OrgInfoStep
                  formData={formData}
                  updateFormData={updateFormData}
                  errors={errors}
                />
              )}
              {step === 2 && (
                <DocumentUploadStep
                  formData={formData}
                  updateFormData={updateFormData}
                  errors={errors}
                />
              )}
              {step === 3 && (
                <OtpConfirmationStep
                  email={formData.orgEmail}
                  otpCode={otpCode}
                  setOtpCode={setOtpCode}
                  errors={errors}
                  otpMessage={otpMessage}
                  isRequestingOtp={isRequestingOtp}
                  onResendOtp={() => requestOtp({ isResend: true })}
                />
              )}

              {errors.submit && (
                <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  {errors.submit}
                </p>
              )}

              <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${
                    step === 1
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  ‹ Back
                </button>

                {step === 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-blue-900 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-blue-950 transition-all shadow-lg shadow-blue-900/20"
                  >
                    Next Step ›
                  </button>
                ) : step === 2 ? (
                  <button
                    type="button"
                    onClick={() => requestOtp()}
                    disabled={isRequestingOtp}
                    className="flex items-center gap-2 bg-blue-900 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-blue-950 transition-all shadow-lg shadow-blue-900/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isRequestingOtp ? "Sending OTP..." : "Send OTP"}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-green-600 text-white px-10 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Registration"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSignUp;
