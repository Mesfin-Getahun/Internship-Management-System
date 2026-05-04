import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../AuthContext';

const fallbackRoles = [
  { id: 'student', name: 'Student', desc: 'Academic learner role.', perms: ['View Opportunities', 'Apply', 'Upload Reports', 'View Feedback'] },
  { id: 'mentor', name: 'Academic Mentor', desc: 'Faculty technical supervisor.', perms: ['Supervise Students', 'Review Reports', 'Academic Evaluation'] },
  { id: 'faculty', name: 'Faculty Admin', desc: 'Departmental coordinator.', perms: ['Manage Students', 'Assign Mentors', 'Authorize Placements'] },
  { id: 'uil', name: 'UIL Officer', desc: 'Corporate linkage manager.', perms: ['Approve Organizations', 'Generate Reports', 'Manage Recommendation Letter'] },
  { id: 'company', name: 'Organization Partner', desc: 'Industrial placement partner.', perms: ['Post Internships', 'Review Applicants', 'Assign Supervisors'] },
  { id: 'company_mentor', name: 'Organization Supervisor', desc: 'Host-company student supervisor.', perms: ['Track Attendance', 'Submit Evaluations', 'Send Feedback'] },
  { id: 'admin', name: 'System Administrator', desc: 'Root system access.', perms: ['Full Access', 'Database Backup', 'Faculty CRUD', 'Maintenance Mode'] },
];

const RolesPermissions = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setUsers(Array.isArray(res.data?.users) ? res.data.users : []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchUsers();
  }, [user?.token]);

  const roleCounts = useMemo(() => {
    return users.reduce((counts, item) => {
      const role = String(item.role || '').toLowerCase();
      counts[role] = (counts[role] || 0) + 1;
      return counts;
    }, {});
  }, [users]);

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Role Access Control</h2>
        <p className="text-slate-500 text-sm mt-1 uppercase text-[10px] font-bold tracking-widest">
          Live account distribution by role
        </p>
      </header>

      {loading && (
        <div className="py-10 text-center text-indigo-600">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fallbackRoles.map((role) => (
          <div key={role.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col hover:shadow-xl transition-all border-b-4 border-b-slate-200 hover:border-b-indigo-500 group">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-lg font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{role.name}</h4>
                <p className="text-xs text-slate-400 font-medium mb-6">{role.desc}</p>
              </div>
              <div className="rounded-2xl bg-indigo-50 px-3 py-2 text-center">
                <p className="text-xl font-black text-indigo-700">{roleCounts[role.id] || 0}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Users</p>
              </div>
            </div>

            <div className="space-y-3 flex-grow">
              {role.perms.map((permission) => (
                <div key={permission} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{permission}</span>
                </div>
              ))}
            </div>

            <p className="mt-8 rounded-2xl bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Permissions are enforced by backend auth middleware.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolesPermissions;
