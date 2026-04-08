import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';

const ManageUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setUsers(Array.isArray(res.data?.users) ? res.data.users : []);
      } catch (error) {
        console.error('Failed to load admin users.', error);
      }
    };

    if (user?.token) {
      fetchUsers();
    }
  }, [user?.token]);

  const roleOptions = useMemo(() => {
    const discoveredRoles = [...new Set(users.map((item) => String(item.role || '').toLowerCase()).filter(Boolean))];
    const orderedRoles = ['student', 'mentor', 'faculty', 'uil', 'company', 'company_mentor', 'admin'];

    return ['all', ...orderedRoles.filter((role) => discoveredRoles.includes(role)), ...discoveredRoles.filter((role) => !orderedRoles.includes(role))];
  }, [users]);

  const roleCounts = useMemo(() => {
    return users.reduce(
      (accumulator, item) => {
        const role = String(item.role || '').toLowerCase();
        accumulator[role] = (accumulator[role] || 0) + 1;
        return accumulator;
      },
      { all: users.length }
    );
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const matchesRole = roleFilter === 'all' || String(item.role || '').toLowerCase() === roleFilter;
      const matchesSearch =
        (item.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.id || '').toLowerCase().includes(searchTerm.toLowerCase());

      return matchesRole && matchesSearch;
    });
  }, [roleFilter, searchTerm, users]);

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Global User Registry</h2>
          <p className="text-slate-500 text-sm mt-1 uppercase text-[10px] font-bold tracking-widest">Authentication and Authorization Audit</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type="text" placeholder="Search name, ID, email..." className="flex-grow px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none w-48" />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none">
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role === 'all' ? 'All Roles' : role.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {roleOptions.map((role) => {
          const isActive = roleFilter === role;
          const label = role === 'all' ? 'All Users' : role.replaceAll('_', ' ');

          return (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${
                isActive
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              {label} ({roleCounts[role] || 0})
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="p-5">User Principal</th>
                <th className="p-5">Access Role</th>
                <th className="p-5">Affiliation</th>
                <th className="p-5 text-center">Active Session</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-5">
                      <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{u.full_name}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{u.email}</div>
                    </td>
                    <td className="p-5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{u.role}</span>
                    </td>
                    <td className="p-5 text-slate-500 font-bold uppercase tracking-tighter text-[11px]">{u.faculty || u.department || 'N/A'}</td>
                    <td className="p-5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${String(u.status || '').toLowerCase() === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{u.status || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">ID: {u.id}</button>
                          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">{u.role}</button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-sm font-medium text-slate-500">
                    No users match the current search and role filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
