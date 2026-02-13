
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepProgressBar from '../components/registration/StepProgressBar.jsx';
import OrgDetailsForm from '../components/registration/OrgDetailsForm.jsx';
import DocUploadForm from '../components/registration/DocUploadForm.jsx';
import RegistrationSuccess from '../components/registration/RegistrationSuccess.jsx';

const RegisterOrganization = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header Section */}
        <div className="bg-blue-600 dark:bg-blue-800 p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold">Register New Organization</h2>
            <p className="opacity-90 mt-1 font-medium text-blue-100">Establish a partnership with the University</p>
          </div>
          <StepProgressBar currentStep={step} />
          
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Content Section */}
        <div className="p-10">
          {step === 1 && (
            <OrgDetailsForm onNext={() => setStep(2)} />
          )}
          
          {step === 2 && (
            <DocUploadForm 
              onNext={() => setStep(3)} 
              onBack={() => setStep(1)} 
            />
          )}
          
          {step === 3 && (
            <RegistrationSuccess onFinish={() => navigate('/')} />
          )}
        </div>
      </div>

      {step < 3 && (
        <button 
          onClick={() => navigate('/')} 
          className="mt-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center text-sm font-bold transition-colors"
        >
          Cancel Registration
        </button>
      )}
    </div>
  );
};

export default RegisterOrganization;
