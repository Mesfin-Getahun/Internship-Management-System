import React, { useState } from 'react';
import SignUpProgressBar from '../../components/signup/SignUpProgressBar';
import OrgInfoStep from '../../components/signup/OrgInfoStep';
import DocumentUploadStep from '../../components/signup/DocumentUploadStep';
import SignUpSuccess from '../../components/signup/SignUpSuccess';

const OrganizationSignUp = () => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    orgName: '', orgType: '', industry: '', website: '', orgEmail: '', orgPhone: '', address: '', city: '', region: '',
    password: '', confirmPassword: '',
    licenseFile: null, profileFile: null, agreed: false
  });
  const [errors, setErrors] = useState({});

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
    const field = Object.keys(data)[0];
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.orgName) newErrors.orgName = 'Organization name is required';
      if (!formData.orgEmail) newErrors.orgEmail = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.orgEmail)) newErrors.orgEmail = 'Invalid email format';
      if (!formData.orgPhone) newErrors.orgPhone = 'Phone is required';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    } else if (step === 2) {
      if (!formData.agreed) newErrors.agreed = 'You must agree to the terms';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep(prev => prev + 1); };
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (validateStep()) {
      console.log('Submitting registration:', formData);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) return (
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
            <h1 className="text-3xl font-bold mb-2">Organization Registration</h1>
            <p className="text-blue-100 opacity-90">Register your organization to offer internships. Your request will be reviewed by the University Industry Linkage Office.</p>
          </div>
          <div className="p-8 md:p-12">
            <SignUpProgressBar currentStep={step} totalSteps={2} />
            <form onSubmit={handleSubmit}>
              {step === 1 && <OrgInfoStep formData={formData} updateFormData={updateFormData} errors={errors} />}
              {step === 2 && <DocumentUploadStep formData={formData} updateFormData={updateFormData} errors={errors} />}

              <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-100">
                <button type="button" onClick={handleBack} disabled={step === 1} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${step === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}>
                  ‹ Back
                </button>

                {step < 2 ? (
                  <button type="button" onClick={handleNext} className="flex items-center gap-2 bg-blue-900 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-blue-950 transition-all shadow-lg shadow-blue-900/20">
                    Next Step ›
                  </button>
                ) : (
                  <button type="submit" className="flex items-center gap-2 bg-green-600 text-white px-10 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20">Submit Registration ✉️</button>
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
