import React, { useState } from 'react';
import { FileText, Plus, Download, Clock, CheckCircle, XCircle } from 'lucide-react';

// Mock data for request history
const initialRequests = [
  { id: 1, type: 'Recommendation Letter', date: '2024-05-15', status: 'Approved' },
  { id: 2, type: 'Acceptance Letter', date: '2024-05-10', status: 'Pending' },
  { id: 3, type: 'Recommendation Letter', date: '2024-04-20', status: 'Rejected' },
];

const StatusBadge = ({ status }) => {
  const styles = {
    Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
    Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
  };
  const icons = {
    Approved: <CheckCircle size={14} />,
    Pending: <Clock size={14} />,
    Rejected: <XCircle size={14} />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold px-2.5 py-1 text-xs rounded-full ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
};

const LetterRequests = () => {
  const [requests, setRequests] = useState(initialRequests);
  const [letterType, setLetterType] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!letterType) {
      alert('Please select a letter type.');
      return;
    }
    const newRequest = {
      id: requests.length + 1,
      type: letterType,
      date: new Date().toISOString().split('T')[0], // format as YYYY-MM-DD
      status: 'Pending',
    };
    setRequests([newRequest, ...requests]);
    setLetterType('');
    setMessage('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Letter Requests</h2>
        <p className="text-slate-500 text-sm mt-1 font-medium">Request official letters from the UIL office.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-lg flex items-center gap-2">
              <Plus size={20} />
              Request a New Letter
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="letterType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Letter Type <span className="text-red-500">*</span></label>
                <select
                  id="letterType"
                  value={letterType}
                  onChange={(e) => setLetterType(e.target.value)}
                  className="input-field w-full bg-slate-100 dark:bg-slate-800"
                  required
                >
                  <option value="">Select a type...</option>
                  <option value="Recommendation Letter">Recommendation Letter</option>
                  <option value="Acceptance Letter">Acceptance Letter</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason / Message (Optional)</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="4"
                  className="input-field w-full bg-slate-100 dark:bg-slate-800"
                  placeholder="Provide any additional details for the UIL office..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:bg-slate-400"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white p-6 border-b border-slate-100 dark:border-slate-800 text-lg">Request History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Letter Type</th>
                    <th scope="col" className="px-6 py-3">Date Requested</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">{request.type}</td>
                      <td className="px-6 py-4">{request.date}</td>
                      <td className="px-6 py-4"><StatusBadge status={request.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <button
                          disabled={request.status !== 'Approved'}
                          className="font-bold text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed flex items-center gap-1 justify-end"
                        >
                          <Download size={14} />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LetterRequests;
