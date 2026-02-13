
import React from 'react';

const ApplicantDetailModal = ({ applicant, isOpen, onClose, onAction }) => {
  if (!isOpen || !applicant) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col animate-fade-in">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-600/20">
              {applicant.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{applicant.name}</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{applicant.faculty}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-8 space-y-8">
          
          {/* Academic Info Grid */}
          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Academic Summary</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Cumulative GPA</p>
                <p className="text-lg font-black text-blue-600 dark:text-blue-400">{applicant.gpa || '3.85'}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Year of Study</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">4th Year</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Department</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">SE</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">ID Number</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">BIT/102/13</p>
              </div>
            </div>
          </section>

          {/* Motivation Statement */}
          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Motivation Statement</h4>
            <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed text-slate-600 dark:text-slate-400 text-sm italic">
              "I am highly motivated to join your organization as an intern to apply my skills in full-stack development. During my time at BIT, I have developed a strong foundation in React and Node.js. I am particularly interested in how your group handles large-scale aviation logistics systems and hope to contribute while learning from your expert engineering team."
            </div>
          </section>

          {/* Documents Section */}
          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Supporting Documents</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 group hover:border-blue-400 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Curriculum Vitae (CV)</p>
                    <p className="text-[10px] text-slate-400 font-medium">Uploaded on {applicant.date}</p>
                  </div>
                </div>
                <button className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline">Preview PDF</button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 group hover:border-blue-400 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Academic Transcript</p>
                    <p className="text-[10px] text-slate-400 font-medium">Verified by Registrar</p>
                  </div>
                </div>
                <button className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline">View Transcript</button>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-4">
          <button 
            onClick={() => onAction('Rejected')}
            className="flex-1 py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 dark:hover:border-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all"
          >
            Reject Application
          </button>
          <button 
            onClick={() => onAction('Approved')}
            className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all transform active:scale-[0.98]"
          >
            Approve & Select Student
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetailModal;
