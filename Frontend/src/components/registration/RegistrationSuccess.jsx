
import React from 'react';

const RegistrationSuccess = ({ onFinish }) => {
  return (
    <div className="text-center py-8 animate-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-3">Registration Pending</h3>
      <p className="text-slate-500 mb-10 leading-relaxed max-w-sm mx-auto">
        Your application has been received and is currently <span className="font-bold text-slate-700 underline decoration-amber-400">Pending UIL Approval</span>. 
        You will receive an email once verified.
      </p>
      <button onClick={onFinish} className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg">
        Back to Portal
      </button>
    </div>
  );
};

export default RegistrationSuccess;
