import React from 'react';
import { INDUSTRY_TYPES } from '../../../constants.js';

const InternshipCapabilityStep = ({ formData, updateFormData, errors }) => {
  const handleFieldToggle = (field) => {
    const currentFields = [...formData.offeredFields];
    const index = currentFields.indexOf(field);
    if (index > -1) currentFields.splice(index, 1);
    else currentFields.push(field);
    updateFormData({ offeredFields: currentFields });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Internship Fields Offered</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {INDUSTRY_TYPES.map(field => (
              <button
                type="button"
                key={field}
                onClick={() => handleFieldToggle(field)}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left ${formData.offeredFields.includes(field) ? 'bg-blue-900 border-blue-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-900'}`}
              >
                {field}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Max Interns per Term</label>
            <input
              type="number"
              min="1"
              value={formData.maxInterns}
              onChange={e => updateFormData({ maxInterns: e.target.value })}
              className="block w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all"
              placeholder="e.g. 10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration Options</label>
            <select
              value={formData.duration}
              onChange={e => updateFormData({ duration: e.target.value })}
              className="block w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all"
            >
              <option value="3 months">3 Months</option>
              <option value="6 months">6 Months</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Training Program Description</label>
          <textarea
            value={formData.description}
            onChange={e => updateFormData({ description: e.target.value })}
            rows={4}
            className={`block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition-all resize-none ${errors.description ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
            placeholder="Briefly describe the training program and what interns will learn..."
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
        </div>
      </div>
    </div>
  );
};

export default InternshipCapabilityStep;
