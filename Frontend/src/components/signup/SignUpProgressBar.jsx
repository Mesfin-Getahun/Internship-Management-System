import React from 'react';
const SignUpProgressBar = ({ currentStep, totalSteps }) => {
  const steps = ['Org Info', 'Contact Person', 'Capabilities', 'Documents'];
  return (
    <div className="mb-10">
      <div className="flex justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-blue-900 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(currentStep - 1) / (totalSteps - 1) * 100}%` }}
        />
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;
          const isCurrent = stepNumber === currentStep;
          return (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${isActive ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/30' : 'bg-white border-2 border-slate-200 text-slate-400'} ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                {stepNumber}
              </div>
              <span className={`mt-2 text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-blue-900' : 'text-slate-400'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SignUpProgressBar;
