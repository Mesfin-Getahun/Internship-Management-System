import React, { useState } from 'react';
import { Check, Mail, ShieldCheck, Rocket } from 'lucide-react';

const InternshipProcess = () => {
  // This state would be managed globally (e.g., via Context or Redux) based on user data
  const [appState, setAppState] = useState('ACCEPTED'); // Mock states: 'ACCEPTED', 'PENDING_UIL', 'ACTIVATED'

  const isSubmitting = false; // This would be part of a mutation's loading state

  const steps = [{
    id: 1,
    title: 'Application Accepted',
    status: 'complete',
    Icon: Check
  }, {
    id: 2,
    title: 'Request Recommendation',
    status: appState === 'ACCEPTED' ? 'current' : 'complete',
    Icon: Mail
  }, {
    id: 3,
    title: 'UIL Approval',
    status: appState === 'PENDING_UIL' ? 'current' : appState === 'ACTIVATED' ? 'complete' : 'pending',
    Icon: ShieldCheck
  }, {
    id: 4,
    title: 'Internship Activated',
    status: appState === 'ACTIVATED' ? 'complete' : 'pending',
    Icon: Rocket
  }];

  const handleRequestRecommendation = () => {
    // This would trigger a mutation to the backend
    console.log('Requesting recommendation...');
    // For demonstration, we'll just update the local state
    setTimeout(() => setAppState('PENDING_UIL'), 1000);
  };

  const renderContent = () => {
    switch (appState) {
      case 'ACCEPTED':
        return /*#__PURE__*/(
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Congratulations! Your Application is Accepted.</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
              Your application for the Cloud Operations Trainee position at Safaricom Ethiopia has been accepted.
              The next step is to request an official recommendation letter from the University-Industry Linkage (UIL) office.
            </p>
            <button
              onClick={handleRequestRecommendation}
              disabled={isSubmitting}
              className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Request Recommendation Letter'}
            </button>
          </div>
        );
      case 'PENDING_UIL':
        return /*#__PURE__*/(
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Recommendation Request Sent</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
              Your request has been sent to the UIL office. They will review it and provide the necessary documentation.
              You will be notified once it is approved. This page will update automatically.
            </p>
          </div>
        );
      case 'ACTIVATED':
        return /*#__PURE__*/(
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Your Internship is Activated!</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
              All approvals are complete. You can now officially begin your internship. Good luck!
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return /*#__PURE__*/(
    <div className="animate-fade-in space-y-8 max-w-4xl mx-auto pb-12">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Internship Activation Process</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Follow these steps to officially start your placement.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-10">
        <div className="flex justify-between relative mb-12">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 -z-0" />
          {steps.map(step => /*#__PURE__*/(
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md transition-all duration-500 ${
                  step.status === 'complete'
                    ? 'bg-emerald-500 text-white'
                    : step.status === 'current'
                    ? 'bg-blue-600 text-white scale-110'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                }`}
              >
                <step.Icon className="h-6 w-6" />
              </div>
              <span
                className={`text-xs font-bold text-center w-24 leading-tight ${
                  step.status === 'current' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-10 border-t border-slate-100 dark:border-slate-700/50 animate-fade-in">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default InternshipProcess;