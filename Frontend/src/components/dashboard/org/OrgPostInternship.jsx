
import React from 'react';

const OrgPostInternship = () => {
  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto pb-10">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Create Internship Opportunity</h2>
        <p className="text-slate-500 text-sm mt-1 text-sm">Define a new role and attract the best BIT talent.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Internship Title</label>
              <input type="text" placeholder="e.g. Junior Cloud Engineer" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Internship Description</label>
              <textarea rows="4" placeholder="Outline the responsibilities, projects, and learning outcomes..." className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Required Skills (Comma separated)</label>
              <input type="text" placeholder="e.g. Python, Docker, React, AWS" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Location</label>
              <input type="text" placeholder="e.g. Addis Ababa / Remote" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Internship Type</label>
              <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>On-site</option>
                <option>Remote</option>
                <option>Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Duration (Months)</label>
              <input type="number" placeholder="3" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Number of Positions</label>
              <input type="number" placeholder="5" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Application Deadline</label>
              <input type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              Save Draft
            </button>
            <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]">
              Publish Internship
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrgPostInternship;
