
import React from 'react';

const DocUploadForm = ({ onNext, onBack }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="p-8 border-2 border-dashed border-blue-200 dark:border-blue-800/50 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 text-center group hover:border-blue-400 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-blue-400 mb-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-blue-700 dark:text-blue-300 font-bold mb-1">Upload Business License / Certificate</p>
        <p className="text-blue-500 dark:text-blue-400 text-xs mb-6">PDF, PNG or JPG (Max 10MB)</p>
        <input type="file" className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold cursor-pointer hover:bg-blue-700 transition-all shadow-md active:scale-95 inline-block">
          Select Document
        </label>
      </div>

      <div>
        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2 text-sm">Tax Identification Number (TIN)</label>
        <input type="text" placeholder="10-digit number" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 dark:text-white" />
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl">
        <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-tight">
          <span className="font-bold">Note:</span> By submitting, you agree that all provided information is accurate. False information will lead to immediate rejection of the partnership.
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <button onClick={onBack} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
          Previous
        </button>
        <button onClick={onNext} className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98]">
          Submit for Approval
        </button>
      </div>
    </div>
  );
};

export default DocUploadForm;
