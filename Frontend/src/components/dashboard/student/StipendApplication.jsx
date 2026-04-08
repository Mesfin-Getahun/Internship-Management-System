import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faMoneyBillWave, faCheckCircle, faClock, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

const StatusDisplay = ({ status }) => {
  const statusConfig = {
    'Not Submitted': {
      icon: <FontAwesomeIcon icon={faTimesCircle} className="text-slate-400" />,
      text: 'You have not submitted your stipend application yet.',
      bg: 'bg-slate-100 dark:bg-slate-800',
    },
    'Pending Approval': {
      icon: <FontAwesomeIcon icon={faClock} className="text-amber-500" />,
      text: 'Your application is pending approval from the UIL office.',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    'Approved': {
      icon: <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" />,
      text: 'Your stipend application has been approved.',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    'Rejected': {
      icon: <FontAwesomeIcon icon={faTimesCircle} className="text-rose-500" />,
      text: 'Your stipend application was rejected. Please review and resubmit your details.',
      bg: 'bg-rose-100 dark:bg-rose-900/30',
    },
  };

  const current = statusConfig[status] || statusConfig['Not Submitted'];

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
  const [status, setStatus] = useState('Not Submitted');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingPayment, setExistingPayment] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPaymentApplication = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/student/paymentApplication`,
          { headers: { Authorization: `Bearer ${user?.token}` } }
        );

        const payment = res.data?.payment || null;
        setExistingPayment(payment);

        if (payment) {
          setFormData((prev) => ({
            ...prev,
            bankName: payment.bank_name || payment.bank || '',
            accountHolder: payment.account_holder || payment.student_name || '',
            accountNumber: payment.account_number || payment.account_no || '',
          }));
          setStatus(payment.status || 'Pending Approval');
        } else {
          setStatus('Not Submitted');
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load stipend application data.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchPaymentApplication();
    } else {
      setLoading(false);
      setError('Student session token is missing. Please sign in again.');
    }
  }, [user?.token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setSuccess('');
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setError('');
    setSuccess('');
    setFormData(prev => ({ ...prev, acceptanceLetter: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.bankName || !formData.accountHolder || !formData.accountNumber || !formData.acceptanceLetter) {
      setError('Please fill all fields and upload the acceptance letter.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append('bankName', formData.bankName);
      payload.append('accountHolder', formData.accountHolder);
      payload.append('accountNumber', formData.accountNumber);
      payload.append('acceptanceLetter', formData.acceptanceLetter);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/student/paymentApplication`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const payment = res.data?.payment || null;
      setExistingPayment(payment);
      setStatus(payment?.status || 'Pending Approval');
      setSuccess(res.data?.message || 'Payment application submitted successfully.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit stipend application.');
    } finally {
      setSubmitting(false);
    }
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
            {loading ? (
              <div className="flex justify-center items-center min-h-[320px] text-indigo-500">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FontAwesomeIcon icon={faMoneyBillWave} size={18} /> Bank Account Details
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
                  <FontAwesomeIcon icon={faCloudUploadAlt} size={18} /> Document Upload
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
                {!formData.acceptanceLetter && existingPayment?.acceptance_letter_url && (
                  <a
                    href={existingPayment.acceptance_letter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 mt-2 inline-block"
                  >
                    View previously submitted acceptance letter
                  </a>
                )}
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : existingPayment ? 'Update Application' : 'Submit Application'}
                </button>
              </div>
            </form>
            )}
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
