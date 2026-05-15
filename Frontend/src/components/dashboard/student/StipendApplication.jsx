import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faSpinner } from '@fortawesome/free-solid-svg-icons';


const StipendApplication = () => {
  const [formData, setFormData] = useState({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.bankName || !formData.accountHolder || !formData.accountNumber) {
      setError('Please fill all bank account fields.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/student/paymentApplication`,
        {
          bankName: formData.bankName,
          accountHolder: formData.accountHolder,
          accountNumber: formData.accountNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      const payment = res.data?.payment || null;
      setExistingPayment(payment);
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
        <p className="text-slate-500 text-sm mt-1 font-medium">Submit your bank details to process your stipend.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="max-w-3xl">
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
      </div>
    </div>
  );
};

export default StipendApplication;
