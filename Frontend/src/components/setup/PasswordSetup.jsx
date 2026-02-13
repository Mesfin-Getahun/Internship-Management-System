
import React, { useState, useEffect } from 'react';

const PasswordSetup = ({ onNext }) => {
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [strength, setStrength] = useState(0);

  const validatePassword = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setStrength(score);
    return score >= 5;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validatePassword(passwords.new)) {
      newErrors.new = "Password must be at least 8 chars and include uppercase, lowercase, number, and special char.";
    }
    if (passwords.new !== passwords.confirm) {
      newErrors.confirm = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 4) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
        <h4 className="text-blue-800 dark:text-blue-300 font-bold text-sm mb-1">Step 1: Security Update</h4>
        <p className="text-blue-600 dark:text-blue-400 text-xs">Set a complex password to protect your academic records.</p>
      </div>

      <div>
        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2 text-sm">New Password</label>
        <input 
          type="password" 
          required
          placeholder="Min 8 characters"
          className={`w-full px-4 py-3 rounded-xl border ${errors.new ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 dark:text-white transition-all`}
          value={passwords.new}
          onChange={(e) => {
            setPasswords({...passwords, new: e.target.value});
            validatePassword(e.target.value);
            if (errors.new) setErrors({...errors, new: null});
          }}
        />
        
        {/* Strength Meter */}
        <div className="mt-3 flex gap-1 h-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${strength >= i ? getStrengthColor() : 'bg-slate-200 dark:bg-slate-800'}`}></div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Security Strength: {['Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength-1] || 'None'}</p>
        
        {errors.new && <p className="text-red-500 text-xs mt-2 font-medium">{errors.new}</p>}
      </div>

      <div>
        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2 text-sm">Confirm New Password</label>
        <input 
          type="password" 
          required
          placeholder="Repeat password"
          className={`w-full px-4 py-3 rounded-xl border ${errors.confirm ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 dark:text-white transition-all`}
          value={passwords.confirm}
          onChange={(e) => {
            setPasswords({...passwords, confirm: e.target.value});
            if (errors.confirm) setErrors({...errors, confirm: null});
          }}
        />
        {errors.confirm && <p className="text-red-500 text-xs mt-2 font-medium">{errors.confirm}</p>}
      </div>

      <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98]">
        Verify & Continue
      </button>
    </form>
  );
};

export default PasswordSetup;
