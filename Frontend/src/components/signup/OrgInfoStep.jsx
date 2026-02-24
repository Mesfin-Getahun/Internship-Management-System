import React from 'react';

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
          <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number</label>
          <input
            type="text"
            value={formData.regNumber}
            onChange={e => updateFormData({ regNumber: e.target.value })}
            className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all ${errors.regNumber ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
            placeholder="e.g. REG-123456"
          />
          {errors.regNumber && <p className="mt-1 text-xs text-red-500">{errors.regNumber}</p>}
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
      </div>
    </div>
  );
};

export default OrgInfoStep;
