
import React, { useState } from 'react';

const MentorEvaluation = () => {
  const [rating, setRating] = useState({ conduct: 0, technical: 0, communication: 0, solving: 0 });

  const setCriteriaRating = (key, val) => {
    setRating(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto pb-12">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Submit Academic Evaluation</h2>
        <p className="text-slate-500 text-sm mt-1 font-medium">Evaluate the student's technical and professional progress for academic credits.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
        <form className="space-y-10" onSubmit={e => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Select Student</label>
              <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option>Abebe Bikila (Software Eng.)</option>
                <option>Saba Tadesse (Software Eng.)</option>
                <option>Mulugeta Seraw (Software Eng.)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Internship Phase</label>
              <input type="text" value="Final Phase (Month 4)" readOnly className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium cursor-not-allowed" />
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Academic Assessment Criteria</h4>
            
            {[
              { id: 'conduct', label: 'Professional Conduct & Ethics' },
              { id: 'technical', label: 'Technical Proficiency & Skill Application' },
              { id: 'communication', label: 'Communication & Collaboration' },
              { id: 'solving', label: 'Critical Thinking & Problem Solving' }
            ].map(criteria => (
              <div key={criteria.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{criteria.label}</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCriteriaRating(criteria.id, star)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        rating[criteria.id] >= star ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800 rounded-2xl">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">∑</div>
               <p className="text-sm font-bold text-teal-800 dark:text-teal-400 uppercase tracking-widest">Cumulative Academic Score</p>
             </div>
             <div className="text-4xl font-black text-teal-600">
               {Object.values(rating).reduce((a, b) => a + b, 0)} <span className="text-sm font-bold text-slate-400">/ 20</span>
             </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Qualitative Assessment & Recommendations</label>
            <textarea rows="4" placeholder="Enter academic feedback for the faculty records..." className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"></textarea>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="px-12 py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 active:scale-95">
              Submit Final Assessment
            </button>
          </div>
        </form>
      </div>
      
      <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-2xl">
        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-tight uppercase tracking-widest">
          Academic Integrity Notice: This evaluation is confidential and sent directly to the Faculty of Computing records. It is used to determine the student's internship grade.
        </p>
      </div>
    </div>
  );
};

export default MentorEvaluation;
