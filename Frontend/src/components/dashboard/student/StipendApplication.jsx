import React, { useState } from 'react';
import { DollarSign, UploadCloud, Banknote, User, Hash, CheckCircle, Clock, XCircle } from 'lucide-react';

const StatusDisplay = ({ status }) => {
  const statusConfig = {
    'Not Submitted': {
      icon: <XCircle className="text-slate-400" />,
      text: 'You have not submitted your stipend application yet.',
      bg: 'bg-slate-100 dark:bg-slate-800',
    },
    'Pending Approval': {
      icon: <Clock className="text-amber-500" />,
      text: 'Your application is pending approval from the UIL office.',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    'Approved': {
      icon: <CheckCircle className="text-emerald-500" />,
      text: 'Your stipend application has been approved.',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
  };

  const current = statusConfig[status];

  return (
    <div className={`p-6 rounded-3xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 ${current.bg}`}>
      <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center">
        {current.icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-800 dark:text-white">Application Status</h4>
        <p className="text-sm text-slate-600 dark:text-slate-300">{current.text}</p>
      </div>
    </div>
  );
};


const StipendApplication = () => {
  const [formData, setFormData] = useState({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    acceptanceLetter: null,
  });
  const [status, setStatus] = useState('Not Submitted'); // 'Not Submitted', 'Pending Approval', 'Approved'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, acceptanceLetter: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.bankName || !formData.accountHolder || !formData.accountNumber || !formData.acceptanceLetter) {
      alert('Please fill all fields and upload the acceptance letter.');
      return;
    }
    console.log('Submitting Stipend Application:', formData);
    setStatus('Pending Approval');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Stipend Application</h2>
        <p className="text-slate-500 text-sm mt-1 font-medium">Submit your bank details and signed acceptance letter to process your stipend.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Banknote size={18} /> Bank Account Details
                </div>
                <div>
                  <label className="form-label" htmlFor="bankName">Bank Name</label>
                  <input type="text" id="bankName" name="bankName" value={formData.bankName} onChange={handleChange} className="input-field w-full bg-slate-100 dark:bg-slate-800" required />
                </div>
                <div>
                  <label className="form-label" htmlFor="accountHolder">Account Holder Name</label>
                  <input type="text" id="accountHolder" name="accountHolder" value={formData.accountHolder} onChange={handleChange} className="input-field w-full bg-slate-100 dark:bg-slate-800" required />
                </div>
                <div className="md:col-span-2">
                  <label className="form-label" htmlFor="accountNumber">Account Number</label>
                  <input type="text" id="accountNumber" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="input-field w-full bg-slate-100 dark:bg-slate-800" required />
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
                  <UploadCloud size={18} /> Document Upload
                </div>
                <label className="form-label" htmlFor="acceptanceLetter">Signed Acceptance Letter (PDF) <span className="text-red-500">*</span></label>
                <input
                  type="file"
                  id="acceptanceLetter"
                  name="acceptanceLetter"
                  onChange={handleFileChange}
                  accept=".pdf"
                  required
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900"
                />
                {formData.acceptanceLetter && <p className="text-xs text-green-600 mt-2">File selected: {formData.acceptanceLetter.name}</p>}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={status !== 'Not Submitted'}
                  className="w-full bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {status === 'Not Submitted' ? 'Submit Application' : 'Submitted'}
                </button>
              </div>
            </form>
          </div>

          {/* Status */}
          <div className="lg:col-span-1">
            <StatusDisplay status={status} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StipendApplication;
