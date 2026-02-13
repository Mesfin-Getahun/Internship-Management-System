
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PasswordSetup from '../../components/setup/PasswordSetup.jsx';
import ProfileSetup from '../../components/setup/ProfileSetup.jsx';

const FirstTimeSetup = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const isStudent = role?.toLowerCase() === 'student';
  const displayRole = role?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const handlePasswordComplete = () => {
    if (isStudent) {
      setStep(2);
    } else {
      alert(`${displayRole} Account Activated! Redirecting to Dashboard...`);
      navigate('/'); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-8 pb-0 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-4 shadow-sm ring-4 ring-white dark:ring-slate-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Account Activation</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isStudent ? `Completing your ${displayRole} profile` : `Securing your ${displayRole} account`}
          </p>
          
          {isStudent && (
            <div className="flex justify-center gap-2 mt-6">
              <div className={`h-1.5 w-12 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
              <div className={`h-1.5 w-12 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
            </div>
          )}
        </div>

        <div className="p-10">
          {step === 1 ? (
            <PasswordSetup onNext={handlePasswordComplete} />
          ) : (
            <ProfileSetup 
              role={role} 
              onFinish={() => {
                alert('Student Setup Complete! Redirecting to Dashboard...');
                navigate('/');
              }} 
            />
          )}
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 dark:text-slate-500 text-xs text-center max-w-sm">
        This is a security protocol required by the University Information Logistics Office to protect institutional data.
      </p>
    </div>
  );
};

export default FirstTimeSetup;
