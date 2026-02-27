import React, { useState } from 'react';
import ChangePassword from '../components/setup/ChangePassword';
import BuildProfile from '../components/setup/BuildProfile';

const FirstTimeSetup = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200 dark:border-slate-700">
          {step === 1 && <ChangePassword onComplete={() => setStep(2)} />}
          {step === 2 && <BuildProfile />}
        </div>
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
          You must complete this setup before accessing your dashboard.
        </p>
      </div>
    </div>
  );
};

export default FirstTimeSetup;
