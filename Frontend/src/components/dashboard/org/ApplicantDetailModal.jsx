import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFilePdf, faFileAlt } from '@fortawesome/free-solid-svg-icons';

const parseSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills.filter(Boolean).map((skill) => String(skill).trim()).filter(Boolean);
  }

  if (typeof skills !== 'string') {
    return [];
  }

  return skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
};

const ApplicantDetailModal = ({ applicant, isOpen, onClose, onAction }) => {
  if (!isOpen || !applicant) return null;

  const studentName = applicant.student_name || applicant.name || 'Unknown Student';
  const faculty = applicant.faculty || applicant.department || 'Not specified';
  const applicationDate = applicant.applied_date || applicant.submitted_at;
  const studentSkills = parseSkills(applicant.skills);

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
              {studentName.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{studentName}</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{faculty}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400"
          >
            <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
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
                <p className="text-lg font-black text-blue-600 dark:text-blue-400">{applicant.gpa || 'N/A'}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Year of Study</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{applicant.year_of_study || 'Not provided'}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Department</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{faculty}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">ID Number</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{applicant.student_id || 'Not provided'}</p>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Student Skills</h4>
            <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              {studentSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {studentSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 text-xs font-bold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No skills were added to this student profile.</p>
              )}
            </div>
          </section>

          {/* Motivation Statement */}
          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Motivation Statement</h4>
            <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed text-slate-600 dark:text-slate-400 text-sm italic">
              {applicant.statement || 'No motivation statement was included with this application.'}
            </div>
          </section>

          {/* Documents Section */}
          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Supporting Documents</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 group hover:border-blue-400 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
                    <FontAwesomeIcon icon={faFilePdf} className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Curriculum Vitae (CV)</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Uploaded on {applicationDate ? new Date(applicationDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <a
                  href={applicant.cv_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline"
                >
                  Preview PDF
                </a>
              </div>

              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 group hover:border-blue-400 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                    <FontAwesomeIcon icon={faFileAlt} className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Academic Transcript</p>
                    <p className="text-[10px] text-slate-400 font-medium">Supporting academic document</p>
                  </div>
                </div>
                <a
                  href={applicant.academic_doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline"
                >
                  View Transcript
                </a>
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
