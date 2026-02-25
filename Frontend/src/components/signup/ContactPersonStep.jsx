import React, { useState, useEffect } from 'react';

const ContactPersonStep = ({ formData, updateFormData, errors }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState({ score: 0, label: 'None', color: 'bg-slate-200' });

  useEffect(() => {
    calculateStrength(formData.password);
  }, [formData.password]);

  const calculateStrength = (pass) => {
    if (!pass) {
      setStrength({ score: 0, label: 'None', color: 'bg-slate-200' });
      return;
    }
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    setStrength({ score: score || 1, label: labels[Math.max(0, score - 1)], color: colors[Math.max(0, score - 1)] });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            value={formData.adminName}
            onChange={e => updateFormData({ adminName: e.target.value })}
            className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all ${errors.adminName ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
            placeholder="John Doe"
          />
          {errors.adminName && <p className="mt-1 text-xs text-red-500">{errors.adminName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Position / Title</label>
          <input
            type="text"
            value={formData.adminPosition}
            onChange={e => updateFormData({ adminPosition: e.target.value })}
            className="block w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all"
            placeholder="HR Manager"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            value={formData.adminEmail}
            onChange={e => updateFormData({ adminEmail: e.target.value })}
            className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all ${errors.adminEmail ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
            placeholder="john@org.com"
          />
          {errors.adminEmail && <p className="mt-1 text-xs text-red-500">{errors.adminEmail}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={formData.adminPhone}
            onChange={e => updateFormData({ adminPhone: e.target.value })}
            className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all ${errors.adminPhone ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
            placeholder="09..."
          />
          {errors.adminPhone && <p className="mt-1 text-xs text-red-500">{errors.adminPhone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Username (for login)</label>
          <input
            type="text"
            value={formData.username}
            onChange={e => updateFormData({ username: e.target.value })}
            className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all ${errors.username ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
            placeholder="johndoe_org"
          />
          {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={e => updateFormData({ password: e.target.value })}
              className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all pr-10 ${errors.password ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Strength</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${strength.color} transition-all duration-500`} style={{ width: `${strength.score / 4 * 100}%` }} />
            </div>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>
      </div>
    </div>
  );
};

export default ContactPersonStep;
