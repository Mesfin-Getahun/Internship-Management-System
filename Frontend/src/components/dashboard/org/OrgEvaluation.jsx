
import React, { useState } from 'react';

const OrgEvaluation = () => {
  const [rating, setRating] = useState(0);

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Submit Student Evaluation</h2>
        <p className="text-slate-500 text-sm mt-1">Final performance assessment for students completing their internship.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
        <form className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Select Student</label>
              <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Abebe Bikila (Software Engineering)</option>
                <option>Saba Tadesse (Civil Engineering)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Internship Role</label>
              <input type="text" value="Web Developer Intern" readOnly className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium cursor-not-allowed" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-slate-700 dark:text-slate-300 font-bold text-sm">Performance Rating (1-5)</label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    rating >= star ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="ml-4 flex items-center text-sm font-bold text-slate-500">
                {['', 'Needs Improvement', 'Fair', 'Good', 'Very Good', 'Exceptional'][rating]}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-slate-700 dark:text-slate-300 font-bold text-sm">Skills Assessment</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Technical Proficiency', 'Communication', 'Punctuality', 'Problem Solving', 'Teamwork', 'Innovation', 'Documentation', 'Ethics'].map(skill => (
                <label key={skill} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <input type="checkbox" className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Final Comments / Recommendation</label>
            <textarea rows="4" placeholder="Summarize the student's overall performance and areas for growth..." className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
              Submit Final Evaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrgEvaluation;
