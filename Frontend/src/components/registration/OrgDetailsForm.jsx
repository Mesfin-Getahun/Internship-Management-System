
import React, { useState } from 'react';
import { INDUSTRY_TYPES } from '../../../constants';

const OrgDetailsForm = ({ onNext }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid official email address.');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2 text-sm">Full Legal Name of Organization</label>
          <input type="text" placeholder="e.g. Ethiopian Airlines" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 dark:text-white" />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2 text-sm">Company Website</label>
          <input type="url" placeholder="https://www.company.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 dark:text-white" />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2 text-sm">Official Email</label>
          <input 
            type="email" 
            placeholder="hr@company.com" 
            className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 dark:text-white`}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
          />
          {error && <p className="text-red-500 text-[10px] mt-1 font-bold">{error}</p>}
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2 text-sm">Industry Type</label>
          <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {INDUSTRY_TYPES.map(type => <option key={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2 text-sm">Headquarters Location</label>
          <input type="text" placeholder="Addis Ababa, Ethiopia" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      
      <div>
        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2 text-sm">Brief Company Description</label>
        <textarea 
          rows="3" 
          placeholder="Describe your company's core business and mission..." 
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        ></textarea>
      </div>

      <button onClick={handleNext} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98]">
        Next Step: Primary Contact & Docs
      </button>
    </div>
  );
};

export default OrgDetailsForm;
