
import React from 'react';

const ManageUsers = () => {
  const users = [
    { name: 'Abebe Bikila', email: 'abebe.b@bit.edu.et', role: 'Student', faculty: 'Computing', status: 'Active', last: '2h ago' },
    { name: 'Officer Yonas', email: 'yonas.uil@bit.edu.et', role: 'UIL Officer', faculty: 'Admin', status: 'Active', last: '12m ago' },
    { name: 'Dr. Samuel K.', email: 'samuel.k@bit.edu.et', role: 'Faculty', faculty: 'Computing', status: 'Active', last: 'Yesterday' },
    { name: 'Eng. Solomon', email: 'solomon.t@bit.edu.et', role: 'Mentor', faculty: 'Civil Eng.', status: 'Inactive', last: '2 weeks ago' },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Global User Registry</h2>
          <p className="text-slate-500 text-sm mt-1 uppercase text-[10px] font-bold tracking-widest">Authentication and Authorization Audit</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <input type="text" placeholder="Search UUID/Email..." className="flex-grow px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none w-48" />
          <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none">
            <option>All Roles</option>
            <option>Student</option>
            <option>Mentor</option>
            <option>Faculty</option>
          </select>
        </div>
      </header>

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
              {users.map((u, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5">
                    <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{u.name}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{u.email}</div>
                  </td>
                  <td className="p-5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{u.role}</span>
                  </td>
                  <td className="p-5 text-slate-500 font-bold uppercase tracking-tighter text-[11px]">{u.faculty}</td>
                  <td className="p-5 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{u.last}</span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                     <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Password Reset</button>
                        <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Disable</button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
