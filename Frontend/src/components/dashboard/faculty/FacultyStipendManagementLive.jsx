import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';

const FacultyStipendManagementLive = () => {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/payments`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setPayments(Array.isArray(res.data?.payments) ? res.data.payments : []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load payment data.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchPayments();
    else {
      setLoading(false);
      setError('Faculty session token is missing. Please sign in again.');
    }
  }, [user?.token]);

  const filteredPayments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return payments;

    return payments.filter((payment) => {
      const student = (payment.student_name || payment.account_holder || '').toLowerCase();
      const company = (payment.company_name || '').toLowerCase();
      const account = String(payment.account_number || payment.account_no || '').toLowerCase();
      return student.includes(query) || company.includes(query) || account.includes(query);
    });
  }, [payments, searchTerm]);

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Stipend Management</h2>
        <p className="text-slate-500 text-sm mt-1">Payment rows are fetched from the backend payments table for students in this faculty.</p>
      </header>

      <div className="relative max-w-md">
        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by student, company, or account..."
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-8 rounded-3xl">
        {loading ? (
          <div className="flex justify-center py-20 text-indigo-500">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
        ) : error ? (
          <div className="text-center text-slate-500 dark:text-slate-400">{error}</div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center text-slate-500 dark:text-slate-400">No payment records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Company</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Account</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Bank / Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayments.map((payment, index) => (
                  <tr key={payment.payment_id || payment.id || index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-white">{payment.student_name || payment.account_holder || 'Unknown Student'}</div>
                      <div className="text-xs text-slate-500">{payment.student_id || 'No Student ID'}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{payment.company_name || 'No company'}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">{payment.account_number || payment.account_no || 'No account number'}</div>
                      <div className="text-xs text-slate-500">{payment.account_holder || payment.student_name || 'No account holder'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">{payment.bank_name || payment.bank || 'No bank'}</div>
                      <div className="text-xs text-slate-500">{payment.amount ?? payment.payment_amount ?? 'No amount recorded'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyStipendManagementLive;
