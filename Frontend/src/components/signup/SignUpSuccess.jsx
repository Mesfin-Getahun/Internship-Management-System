import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignUpSuccess = () => {
  const navigate = useNavigate();
  return (
    <div className="text-center py-12 animate-fade-in">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
          <span style={{ fontSize: 36 }}>✅</span>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">Registration Submitted!</h2>
      <p className="text-slate-600 max-w-md mx-auto mb-10 leading-relaxed">Your registration has been submitted successfully. Your account will be activated after the University Industry Linkage (UIL) Office reviews and approves your application.</p>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-10 max-w-md mx-auto">
        <p className="text-sm text-blue-800 font-medium">You will receive an email notification once your account status is updated.</p>
      </div>

      <button onClick={() => navigate('/login')} className="inline-flex items-center gap-2 bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-950 transition-all shadow-lg shadow-blue-900/20">
        Return to Login <span style={{ fontSize: 16 }}>➡️</span>
      </button>
    </div>
  );
};

export default SignUpSuccess;
