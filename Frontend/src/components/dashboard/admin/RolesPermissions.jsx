import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const RolesPermissions = () => {
  const roles = [
    { id: 'student', name: 'Student', desc: 'Default academic learner role.', perms: ['View Opportunities', 'Apply', 'Upload Reports', 'View Feedback'] },
    { id: 'mentor', name: 'Academic Mentor', desc: 'Faculty technical supervisor.', perms: ['Supervise Students', 'Review Reports', 'Academic Evaluation'] },
    { id: 'faculty', name: 'Faculty Admin', desc: 'Departmental coordinator.', perms: ['Manage Students', 'Assign Mentors', 'Authorize Placements'] },
    { id: 'uil', name: 'UIL Officer', desc: 'Corporate linkage manager.', perms: ['Approve Organizations', 'Platform Audit', 'Generate Global Reports'] },
    { id: 'org', name: 'Organization Partner', desc: 'Industrial placement partner.', perms: ['Post Internships', 'Review Applicants', 'Corporate Evaluation'] },
    { id: 'admin', name: 'System Administrator', desc: 'Root system access.', perms: ['Full Access', 'Database Backup', 'Faculty CRUD', 'Role Management'] }
  ];

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Role Access Control</h2>
        <p className="text-slate-500 text-sm mt-1 uppercase text-[10px] font-bold tracking-widest">Global Permissions Schema</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col hover:shadow-xl transition-all border-b-4 border-b-slate-200 hover:border-b-indigo-500 group">
            <h4 className="text-lg font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{role.name}</h4>
            <p className="text-xs text-slate-400 font-medium mb-6">{role.desc}</p>
            
            <div className="space-y-3 flex-grow">
              {role.perms.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{p}</span>
                </div>
              ))}
            </div>

            <button className="mt-8 w-full py-3 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
              Configure Schema
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolesPermissions;
