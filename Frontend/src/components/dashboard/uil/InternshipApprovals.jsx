import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEye, faSpinner, faCheckCircle, faTimesCircle, faCheckSquare, faDownload } from '@fortawesome/free-solid-svg-icons';

const InternshipDetailModal = ({ internship, onClose, onApprove, onReject, processingAction }) => {
    if (!internship) return null;
    const status = String(internship.status || 'pending').toLowerCase();
    const isPending = status === 'pending' || status === '';
    const isApproved = status === 'approved';
    const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'TBD';
    const isProcessing = Boolean(processingAction);
    const isRejectProcessing =
      processingAction?.action === 'reject' &&
      String(processingAction?.id) === String(internship.internship_id);
    const isApproveProcessing =
      processingAction?.action === 'approve' &&
      String(processingAction?.id) === String(internship.internship_id);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{internship.title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors" disabled={isProcessing}>
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Status</p>
                        <span className={`inline-flex mt-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                            isApproved
                                ? 'bg-emerald-100 text-emerald-700'
                                : isPending
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-rose-100 text-rose-700'
                        }`}>
                            {internship.status || 'pending'}
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Host Company</p>
                        <p className="font-bold text-slate-800 text-lg">{internship.company_name}</p>
                        <p className="text-sm text-slate-500">{internship.location || 'Location not specified'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Start Date</p>
                            <p className="font-semibold text-slate-700">{formatDate(internship.start_date)}</p>
                        </div>
                         <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">End Date</p>
                            <p className="font-semibold text-slate-700">{formatDate(internship.end_date)}</p>
                        </div>
                    </div>
                </div>

                {isPending ? (
                    <div className="mt-8 flex gap-3 pt-6 border-t border-slate-100">
                        <button 
                            onClick={() => onReject(internship.internship_id)}
                            disabled={isProcessing}
                            className="flex-1 flex justify-center items-center gap-2 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                            <FontAwesomeIcon icon={faTimesCircle} />
                            {isRejectProcessing ? 'Processing...' : 'Reject Internship'}
                        </button>
                        <button 
                            onClick={() => onApprove(internship.internship_id)}
                            disabled={isProcessing}
                            className="flex-1 flex justify-center items-center gap-2 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                            <FontAwesomeIcon icon={faCheckCircle} />
                            {isApproveProcessing ? 'Processing...' : 'Approve Internship'}
                        </button>
                    </div>
                ) : (
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className={`rounded-xl px-4 py-3 text-sm font-bold ${
                          isApproved ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'
                        }`}>
                            This internship is currently {internship.status || 'not pending'}.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const InternshipApprovals = () => {
  const [internships, setInternships] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchInternships = async (tab = activeTab) => {
    if (!user?.token) return;

    try {
      setLoading(true);
      setError('');
      const endpoint = tab === 'pending'
        ? '/api/UIL/internships/pending'
        : '/api/UIL/internships';
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const items = Array.isArray(res.data?.internships) ? res.data.internships : [];
      const visibleItems = tab === 'all'
        ? items
        : items.filter((internship) => String(internship.status || 'pending').toLowerCase() === tab);
      setInternships(visibleItems);
    } catch (err) {
      console.error("Failed to fetch internships", err);
      setError(err.response?.data?.message || 'Failed to load internship requests.');
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchInternships(activeTab);
    } else {
      setLoading(false);
      setError('UIL session token is missing. Please sign in again.');
    }
  }, [user, activeTab]);

  const handleApprove = async (internship_id) => {
    if (!internship_id || !user?.token) {
      setError('Unable to approve internship. Missing internship id or UIL session.');
      return;
    }

    try {
      setProcessingAction({ id: internship_id, action: 'approve' });
      setError('');
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/UIL/approveInternship/${encodeURIComponent(internship_id)}`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setSelectedInternship(null);
      await fetchInternships(activeTab);
    } catch (err) {
      console.error("Failed to approve internship", err);
      setError(err.response?.data?.message || 'Failed to approve internship.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReject = async (internship_id) => {
    if (!internship_id || !user?.token) {
      setError('Unable to reject internship. Missing internship id or UIL session.');
      return;
    }

    try {
      setProcessingAction({ id: internship_id, action: 'reject' });
      setError('');
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/UIL/rejectInternship/${encodeURIComponent(internship_id)}`, { reason: "Administratively rejected." }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setSelectedInternship(null);
      await fetchInternships(activeTab);
    } catch (err) {
      console.error("Failed to reject internship", err);
      setError(err.response?.data?.message || 'Failed to reject internship.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleExportInternships = async () => {
    if (!user?.token) {
      setError('UIL session token is missing. Please sign in again.');
      return;
    }

    try {
      setExporting(true);
      setError('');
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/UIL/internships/export.csv`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
          responseType: 'blob',
        },
      );

      const contentDisposition = res.headers['content-disposition'] || '';
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
      const fileName = fileNameMatch?.[1] || 'uil-internships.csv';
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to export internships', err);
      setError(err.response?.data?.message || 'Failed to export internships.');
    } finally {
      setExporting(false);
    }
  };

  const filteredInternships = internships.filter((internship) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return (
      (internship.title || '').toLowerCase().includes(query) ||
      (internship.company_name || '').toLowerCase().includes(query) ||
      (internship.location || '').toLowerCase().includes(query) ||
      String(internship.status || '').toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (statusValue) => {
    const status = String(statusValue || 'pending').toLowerCase();

    if (status === 'approved') {
      return 'bg-emerald-100 text-emerald-700';
    }
    if (status === 'rejected') {
      return 'bg-rose-100 text-rose-700';
    }
    return 'bg-amber-100 text-amber-700 animate-pulse';
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Internship Management</h2>
          <p className="text-slate-500 text-sm mt-1">Review pending requests and monitor approved internship opportunities in one place.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={handleExportInternships}
          disabled={exporting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-slate-700 disabled:opacity-60"
        >
          <FontAwesomeIcon icon={exporting ? faSpinner : faDownload} spin={exporting} />
          Export CSV
        </button>
        <input
          type="text"
          placeholder="Search title, company, location, status..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full sm:w-72 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
              activeTab === 'pending'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-white'
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
              activeTab === 'approved'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-500 hover:bg-white'
            }`}
          >
            Approved
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-500 hover:bg-white'
            }`}
          >
            All
          </button>
          <button 
             onClick={() => fetchInternships(activeTab)}
             className="px-4 py-2 bg-white text-indigo-600 border border-slate-200 text-xs font-black uppercase tracking-widest hover:border-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
          >
             Refresh
          </button>
        </div>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[300px]">
        {loading ? (
            <div className="flex flex-col justify-center items-center h-64 text-slate-400">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mb-4 text-indigo-500" />
                <p className="font-bold">Loading {activeTab} internships...</p>
            </div>
        ) : error ? (
            <div className="flex flex-col justify-center items-center h-64 text-slate-400 bg-slate-50/30">
                <p className="font-bold">{error}</p>
            </div>
        ) : filteredInternships.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 text-slate-400 bg-slate-50/30">
                <div className="w-16 h-16 bg-slate-100/50 rounded-full flex items-center justify-center mb-4 border border-slate-100 text-slate-300">
                   <FontAwesomeIcon icon={faCheckSquare} size="xl" />
                </div>
                <p className="font-bold">{search ? 'No internships matched your search.' : activeTab === 'approved' ? 'No approved internships found.' : activeTab === 'all' ? 'No internships found.' : 'All caught up!'}</p>
                <p className="text-sm mt-1">{search ? 'Try another title, company, location, or status.' : activeTab === 'approved' ? 'Approved opportunities will appear here.' : activeTab === 'all' ? 'Internship opportunities will appear here.' : 'No pending internship opportunities remain.'}</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Role Title</th>
                            <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Company</th>
                            <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Location</th>
                            <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center whitespace-nowrap">Status</th>
                            <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest whitespace-nowrap">Timeline</th>
                            <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right whitespace-nowrap">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                        {filteredInternships.map(internship => (
                            <tr key={internship.internship_id} onClick={() => setSelectedInternship(internship)} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                <td className="p-5">
                                    <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{internship.title}</div>
                                </td>
                                <td className="p-5">
                                    <div className="font-bold text-slate-600">{internship.company_name}</div>
                                    <div className="text-[11px] text-slate-400">{internship.email || 'No email'}</div>
                                </td>
                                <td className="p-5 text-slate-500 font-semibold text-xs">
                                  {internship.location || 'Remote'}
                                </td>
                                <td className="p-5 text-center">
                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusBadge(internship.status)}`}>
                                      {internship.status || 'pending'}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <div className="text-xs font-semibold text-slate-600">
                                      {internship.start_date ? new Date(internship.start_date).toLocaleDateString() : 'TBD'}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                      to {internship.end_date ? new Date(internship.end_date).toLocaleDateString() : 'TBD'}
                                    </div>
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
          processingAction={processingAction}
      />
    </div>
  );
};

export default InternshipApprovals;
