
import React, { useState } from 'react';

const OrgApprovals = () => {
  const [requests, setRequests] = useState([
    { id: 1, name: 'Safaricom Ethiopia', license: 'BDU-2023-998', email: 'hr@safaricom.et', faculty: 'Computing', status: 'Pending' },
    { id: 2, name: 'CBE', license: 'CBE-TECH-001', email: 'careers@cbe.com', faculty: 'Finance', status: 'Approved' },
    { id: 3, name: 'Hybrid Systems', license: 'HS-772-L', email: 'info@hybrid.et', faculty: 'Computing', status: 'Pending' },
    { id: 4, name: 'Ethio Telecom', license: 'ET-REG-882', email: 'internships@tele.com', faculty: 'Electrical', status: 'Rejected' }
  ]);

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Organization Requests</h2>
          <p className="text-slate-500 text-sm mt-1">Review and verify new industry partner registrations.</p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none">
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
          </select>
          <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none">
            <option>All Faculties</option>
            <option>Computing</option>
            <option>Electrical</option>
          </select>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Organization Entity</th>
                <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Licensing</th>
                <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Faculty Assoc.</th>
                <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center whitespace-nowrap">Compliance</th>
                <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right whitespace-nowrap">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {requests.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5">
                    <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{org.name}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{org.email}</div>
                  </td>
                  <td className="p-5">
                    <div className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg inline-block">{org.license}</div>
                  </td>
                  <td className="p-5 text-slate-500 font-bold uppercase tracking-tighter text-xs">{org.faculty}</td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      org.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      org.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700 animate-pulse'
                    }`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-end gap-2">
                       <button className="p-2.5 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all shadow-sm" title="View Docs">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                       </button>
                       {org.status === 'Pending' && (
                         <>
                           <button className="px-4 py-2 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20">Verify</button>
                           <button className="px-4 py-2 bg-white border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all">Reject</button>
                         </>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">!</div>
        <p className="text-xs text-indigo-700 font-bold leading-relaxed">
          Security Protocol: Verification of industry partners requires valid TIN and official licensing documents as per the 2023 University Guidelines.
        </p>
      </div>
    </div>
  );
};

export default OrgApprovals;
