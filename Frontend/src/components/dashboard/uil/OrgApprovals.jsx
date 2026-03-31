import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEye, faSpinner } from '@fortawesome/free-solid-svg-icons';

const OrgDetailModal = ({ org, onClose, onApprove, onReject, processing }) => {
    if (!org) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full m-4">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">{org.company_name}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800" disabled={processing}>
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <p className="font-semibold text-slate-700">{org.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Phone</p>
                        <p className="font-semibold text-slate-700">{org.phone_number}</p>
                    </div>
                     <div className="md:col-span-2">
                        <p className="text-sm text-slate-500">Status</p>
                        <p className="font-bold text-amber-600 uppercase text-xs tracking-wide">{org.status}</p>
                    </div>
                </div>
                 <div className="mt-8 flex justify-end gap-3">
                    <button 
                        onClick={() => onReject(org.company_id)}
                        disabled={processing}
                        className="px-6 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                        {processing ? 'Processing...' : 'Reject'}
                    </button>
                    <button 
                        onClick={() => onApprove(org.company_id)}
                        disabled={processing}
                        className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {processing ? 'Processing...' : 'Approve'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const OrgApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/UIL/companyRequest`);
      if (res.data.success) {
        setRequests(res.data.companies);
      }
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (company_id) => {
    try {
      setProcessing(true);
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/UIL/acceptCompany/${company_id}`);
      setSelectedOrg(null);
      fetchRequests();
    } catch (err) {
      console.error("Failed to approve company", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (company_id) => {
    try {
       setProcessing(true);
       await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/UIL/rejectCompany/${company_id}`);
       setSelectedOrg(null);
       fetchRequests();
    } catch (err) {
       console.error("Failed to reject company", err);
    } finally {
       setProcessing(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Organization Requests</h2>
          <p className="text-slate-500 text-sm mt-1">Review and verify new industry partner registrations.</p>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[300px]">
        {loading ? (
           <div className="flex flex-col justify-center items-center h-64 text-slate-400">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mb-4 text-indigo-500" />
              <p>Loading requests...</p>
           </div>
        ) : requests.length === 0 ? (
           <div className="flex justify-center items-center h-64 text-slate-500">
               <p>No pending organization requests found.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Organization Entity</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center whitespace-nowrap">Status</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right whitespace-nowrap">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {requests.map((org) => (
                  <tr key={org.company_id} onClick={() => setSelectedOrg(org)} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="p-5">
                      <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{org.company_name}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{org.email} | {org.phone_number}</div>
                    </td>
                    <td className="p-5 text-center">
                      <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 animate-pulse">
                        {org.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-end gap-2">
                         <button className="p-2.5 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all shadow-sm" title="View Details">
                            <FontAwesomeIcon icon={faEye} className="h-5 w-5" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrgDetailModal 
         org={selectedOrg} 
         onClose={() => setSelectedOrg(null)} 
         onApprove={handleApprove}
         onReject={handleReject}
         processing={processing}
      />

      <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">!</div>
        <p className="text-xs text-indigo-700 font-bold leading-relaxed">
          Security Protocol: Verification of industry partners requires valid details before they can post internships.
        </p>
      </div>
    </div>
  );
};

export default OrgApprovals;
