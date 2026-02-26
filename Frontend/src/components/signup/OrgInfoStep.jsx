import React, { useState, useEffect } from 'react';

// Lightweight local lists (keeps Frontend independent of Internship's types file)
const OrganizationTypes = ['Private', 'Public', 'NGO', 'Startup', 'Other'];
const IndustrySectors = [
  'Software Development',
  'Civil Engineering',
  'Manufacturing',
  'Telecommunications',
  'Finance & Banking',
  'Construction'
];

const OrgInfoStep = ({ formData, updateFormData, errors }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
          <input
            type="text"
            value={formData.orgName}
            onChange={e => updateFormData({ orgName: e.target.value })}
            className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all ${errors.orgName ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
            placeholder="e.g. Acme Corp"
          />
          {errors.orgName && <p className="mt-1 text-xs text-red-500">{errors.orgName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Organization Type</label>
          <select
            value={formData.orgType}
            onChange={e => updateFormData({ orgType: e.target.value })}
            className="block w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all"
          >
            <option value="">Select Type</option>
            {OrganizationTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Industry Sector</label>
          <select
            value={formData.industry}
            onChange={e => updateFormData({ industry: e.target.value })}
            className="block w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all"
          >
            <option value="">Select Sector</option>
            {IndustrySectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Organization Email</label>
          <input
            type="email"
            value={formData.orgEmail}
            onChange={e => updateFormData({ orgEmail: e.target.value })}
            className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all ${errors.orgEmail ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
            placeholder="contact@org.com"
          />
          {errors.orgEmail && <p className="mt-1 text-xs text-red-500">{errors.orgEmail}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Organization Phone</label>
          <input
            type="tel"
            value={formData.orgPhone}
            onChange={e => updateFormData({ orgPhone: e.target.value })}
            className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all ${errors.orgPhone ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
            placeholder="e.g. +251911..."
          />
          {errors.orgPhone && <p className="mt-1 text-xs text-red-500">{errors.orgPhone}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Office Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={e => updateFormData({ address: e.target.value })}
            className="block w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all"
            placeholder="Street, Building, Office No."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={e => updateFormData({ city: e.target.value })}
            className="block w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all"
            placeholder="e.g. Addis Ababa"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
          <input
            type="text"
            value={formData.region}
            onChange={e => updateFormData({ region: e.target.value })}
            className="block w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all"
            placeholder="e.g. Amhara"
          />
        </div>

        <div className="md:col-span-2 border-t pt-6 mt-2 border-slate-200" />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Set Password</label>
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
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Strength</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${strength.color} transition-all duration-500`} style={{ width: `${strength.score / 4 * 100}%` }} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={e => updateFormData({ confirmPassword: e.target.value })}
              className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all pr-10 ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
        </div>
      </div>
    </div>
  );
};

export default OrgInfoStep;
