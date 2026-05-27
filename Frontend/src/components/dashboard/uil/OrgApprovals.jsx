import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEye, faSpinner, faDownload } from '@fortawesome/free-solid-svg-icons';

const OrgDetailModal = ({ org, onClose, onApprove, onReject, processingAction }) => {
    if (!org) return null;

    const isProcessing = Boolean(processingAction);
    const isRejectProcessing =
      processingAction?.action === 'reject' &&
      String(processingAction?.id) === String(org.company_id);
    const isApproveProcessing =
      processingAction?.action === 'approve' &&
      String(processingAction?.id) === String(org.company_id);

    const profilePic = org.profile_pic || org.company_profile_pic;
    const licenseUrl = org.company_license_url || org.license_url;

    const detailItems = [
      { label: 'Company Type', value: org.company_type },
      { label: 'Industry', value: org.industry },
      { label: 'Website', value: org.website },
      { label: 'Email', value: org.email },
      { label: 'Phone', value: org.phone_number },
      { label: 'Region', value: org.region },
      { label: 'City', value: org.city },
      { label: 'Address', value: org.location },
      { label: 'Profile Picture URL', value: profilePic },
      { label: 'Company License URL', value: licenseUrl },
      { label: 'Status', value: org.status },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">{org.company_name}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800" disabled={isProcessing}>
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>

                {(profilePic || licenseUrl) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {profilePic && (
                      <div>
                        <p className="text-sm text-slate-500 mb-2">Profile Picture</p>
                        <a
                          href={profilePic}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-400 transition-colors"
                        >
                          <img
                            src={profilePic}
                            alt={`${org.company_name} profile`}
                            className="w-full h-48 object-cover bg-slate-100"
                          />
                        </a>
                      </div>
                    )}
                    {licenseUrl && (
                      <div>
                        <p className="text-sm text-slate-500 mb-2">Business License</p>
                        <a
                          href={licenseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors"
                        >
                          Open license document
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {detailItems.map((item) => (
                      <div key={item.label}>
                        <p className="text-sm text-slate-500">{item.label}</p>
                        {item.label === 'Website' && item.value ? (
                          <a
                            href={item.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-indigo-600 hover:underline break-all"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="font-semibold text-slate-700 break-words">{item.value || 'Not provided'}</p>
                        )}
                      </div>
                    ))}
                </div>
                {org.status === 'pending' && (
                  <div className="mt-8 flex justify-end gap-3">
                      <button 
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onReject(org.company_id);
                          }}
                          disabled={isProcessing}
                          className="px-6 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                          {isRejectProcessing ? 'Processing...' : 'Reject'}
                      </button>
                      <button 
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onApprove(org.company_id);
                          }}
                          disabled={isProcessing}
                          className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                          {isApproveProcessing ? 'Processing...' : 'Approve'}
                      </button>
                  </div>
                )}
            </div>
        </div>
    );
};


const OrgApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.token) {
      fetchRequests(activeTab);
    } else {
      setLoading(false);
      setError('UIL session token is missing. Please sign in again.');
    }
  }, [user, activeTab]);

  const fetchRequests = async (tab = activeTab) => {
    if (!user?.token) return;

    try {
      setLoading(true);
      setError('');
      const endpoint =
        tab === 'approved'
          ? '/api/UIL/companies/active'
          : '/api/UIL/companyRequest';
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const companies = Array.isArray(res.data?.companies) ? res.data.companies : [];
      setRequests(companies);
    } catch (err) {
      console.error("Failed to fetch requests", err);
      setError(err.response?.data?.message || 'Failed to load pending company requests.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (company_id) => {
    if (!company_id || !user?.token) {
      setError('Unable to approve company. Missing company id or UIL session.');
      return;
    }

    try {
      setProcessingAction({ id: company_id, action: 'approve' });
      setError('');
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/UIL/acceptCompany/${encodeURIComponent(company_id)}`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setRequests((prev) => prev.filter((company) => company.company_id !== company_id));
      setSelectedOrg(null);
      await fetchRequests(activeTab);
    } catch (err) {
      console.error("Failed to approve company", err);
      setError(err.response?.data?.message || 'Failed to approve company.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReject = async (company_id) => {
    if (!company_id || !user?.token) {
      setError('Unable to reject company. Missing company id or UIL session.');
      return;
    }

    try {
       setProcessingAction({ id: company_id, action: 'reject' });
       setError('');
       await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/UIL/rejectCompany/${encodeURIComponent(company_id)}`, {}, {
         headers: { Authorization: `Bearer ${user?.token}` }
       });
       setRequests((prev) => prev.filter((company) => company.company_id !== company_id));
       setSelectedOrg(null);
       await fetchRequests(activeTab);
    } catch (err) {
       console.error("Failed to reject company", err);
       setError(err.response?.data?.message || 'Failed to reject company.');
    } finally {
       setProcessingAction(null);
    }
  };

  const handleExportCompanies = async () => {
    if (!user?.token) {
      setError('UIL session token is missing. Please sign in again.');
      return;
    }

    try {
      setExporting(true);
      setError('');
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/UIL/companies/export.csv`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
          responseType: 'blob',
        },
      );

      const contentDisposition = res.headers['content-disposition'] || '';
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
      const fileName = fileNameMatch?.[1] || 'uil-companies.csv';
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
      console.error('Failed to export companies', err);
      setError(err.response?.data?.message || 'Failed to export companies.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Organization Requests</h2>
          <p className="text-slate-500 text-sm mt-1">Review pending registrations and inspect approved industry partners.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportCompanies}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-slate-700 disabled:opacity-60"
          >
            <FontAwesomeIcon icon={exporting ? faSpinner : faDownload} spin={exporting} />
            Export CSV
          </button>
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
          </div>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[300px]">
        {loading ? (
           <div className="flex flex-col justify-center items-center h-64 text-slate-400">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mb-4 text-indigo-500" />
              <p>Loading requests...</p>
           </div>
        ) : error ? (
           <div className="flex justify-center items-center h-64 text-slate-500">
               <p>{error}</p>
           </div>
        ) : requests.length === 0 ? (
           <div className="flex justify-center items-center h-64 text-slate-500">
               <p>{activeTab === 'approved' ? 'No approved organizations found.' : 'No pending organization requests found.'}</p>
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
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        (org.status || '').toLowerCase() === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700 animate-pulse'
                      }`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-end gap-2">
                         <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedOrg(org);
                            }}
                            className="p-2.5 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
                            title="View Details"
                         >
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
         processingAction={processingAction}
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
