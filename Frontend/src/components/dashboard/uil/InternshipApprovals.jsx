import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEye, faSpinner, faCheckCircle, faTimesCircle, faCheckSquare } from '@fortawesome/free-solid-svg-icons';

const InternshipDetailModal = ({ internship, onClose, onApprove, onReject, processing }) => {
    if (!internship) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{internship.title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors" disabled={processing}>
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Host Company</p>
                        <p className="font-bold text-slate-800 text-lg">{internship.company_name}</p>
                        <p className="text-sm text-slate-500">{internship.location || 'Location not specified'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Start Date</p>
                            <p className="font-semibold text-slate-700">{new Date(internship.start_date).toLocaleDateString()}</p>
                        </div>
                         <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">End Date</p>
                            <p className="font-semibold text-slate-700">{new Date(internship.end_date).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-3 pt-6 border-t border-slate-100">
                    <button 
                        onClick={() => onReject(internship.internship_id)}
                        disabled={processing}
                        className="flex-1 flex justify-center items-center gap-2 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faTimesCircle} />
                        {processing ? 'Processing...' : 'Reject Internship'}
                    </button>
                    <button 
                        onClick={() => onApprove(internship.internship_id)}
                        disabled={processing}
                        className="flex-1 flex justify-center items-center gap-2 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faCheckCircle} />
                        {processing ? 'Processing...' : 'Approve Internship'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const InternshipApprovals = () => {
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchPendingInternships = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/UIL/internships/pending`);
      if (res.data.success) {
        setInternships(res.data.internships);
      }
    } catch (err) {
      console.error("Failed to fetch pending internships", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingInternships();
  }, []);

  const handleApprove = async (internship_id) => {
    try {
      setProcessing(true);
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/UIL/approveInternship/${internship_id}`);
      setSelectedInternship(null);
      fetchPendingInternships();
    } catch (err) {
      console.error("Failed to approve internship", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (internship_id) => {
    try {
      setProcessing(true);
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/UIL/rejectInternship/${internship_id}`, { reason: "Administratively rejected." });
      setSelectedInternship(null);
      fetchPendingInternships();
    } catch (err) {
      console.error("Failed to reject internship", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Internship Approvals</h2>
          <p className="text-slate-500 text-sm mt-1">Review and approve new internship opportunities posted by active companies.</p>
        </div>
        <button 
           onClick={fetchPendingInternships}
           className="px-4 py-2 bg-white text-indigo-600 border border-slate-200 text-xs font-black uppercase tracking-widest hover:border-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
        >
           Refresh List
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[300px]">
        {loading ? (
            <div className="flex flex-col justify-center items-center h-64 text-slate-400">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mb-4 text-indigo-500" />
                <p className="font-bold">Loading pending internships...</p>
            </div>
        ) : internships.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-slate-400 bg-slate-50/30">
                <div className="w-16 h-16 bg-slate-100/50 rounded-full flex items-center justify-center mb-4 border border-slate-100 text-slate-300">
                   <FontAwesomeIcon icon={faCheckSquare} size="xl" />
                </div>
                <p className="font-bold">All caught up!</p>
                <p className="text-sm mt-1">No pending internship opportunities remain.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Role Title</th>
                            <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Company</th>
                            <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Timeline</th>
                            <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right whitespace-nowrap">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                        {internships.map(internship => (
                            <tr key={internship.internship_id} onClick={() => setSelectedInternship(internship)} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                <td className="p-5">
                                    <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{internship.title}</div>
                                </td>
                                <td className="p-5">
                                    <div className="font-bold text-slate-600">{internship.company_name}</div>
                                    <div className="text-[11px] text-slate-400">{internship.location}</div>
                                </td>
                                <td className="p-5">
                                    <div className="text-xs font-semibold text-slate-600">Starts: {new Date(internship.start_date).toLocaleDateString()}</div>
                                </td>
                                <td className="p-5">
                                    <div className="flex justify-end">
                                         <button className="p-2.5 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all shadow-sm" title="Review">
                                            <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
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

      <InternshipDetailModal 
          internship={selectedInternship}
          onClose={() => setSelectedInternship(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          processing={processing}
      />
    </div>
  );
};

export default InternshipApprovals;
