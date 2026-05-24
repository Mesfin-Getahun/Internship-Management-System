import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getDepartmentOptions, matchesDepartment } from '../../../utils/departmentFilters';

const FacultyStipendManagementLive = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError('');
        const authConfig = {
          headers: { Authorization: `Bearer ${user?.token}` },
        };
        const [paymentsRes, studentsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/payments`, authConfig),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/students`, authConfig),
        ]);
        setPayments(Array.isArray(paymentsRes.data?.payments) ? paymentsRes.data.payments : []);
        setStudents(Array.isArray(studentsRes.data?.students) ? studentsRes.data.students : []);
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

  const departments = useMemo(() => getDepartmentOptions(students), [students]);

  const filteredPayments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return payments.filter((payment) => {
      if (!matchesDepartment(payment, selectedDepartment)) return false;
      if (!query) return true;

      const student = (payment.student_name || payment.account_holder || '').toLowerCase();
      const company = (payment.company_name || '').toLowerCase();
      const account = String(payment.account_number || payment.account_no || '').toLowerCase();
      const department = (payment.department || '').toLowerCase();
      return student.includes(query) || company.includes(query) || account.includes(query) || department.includes(query);
    });
  }, [payments, searchTerm, selectedDepartment]);

  const handleDownloadCsv = async () => {
    if (!user?.token) {
      setError('Faculty session token is missing. Please sign in again.');
      return;
    }

    try {
      setDownloading(true);
      setError('');
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/faculty/stipend-report.csv`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
          responseType: 'blob',
        },
      );

      const contentDisposition = res.headers['content-disposition'] || '';
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
      const fileName = fileNameMatch?.[1] || 'stipend-report.csv';
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
      console.error(err);
      setError(err.response?.data?.message || 'Failed to download stipend report.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Stipend Management</h2>
          <p className="text-slate-500 text-sm mt-1">Payment rows are fetched from the backend payments table for students in this faculty.</p>
        </div>
        <button
          type="button"
          onClick={handleDownloadCsv}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 disabled:opacity-60"
        >
          <FontAwesomeIcon icon={downloading ? faSpinner : faDownload} spin={downloading} />
          Download CSV
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_18rem] gap-4 max-w-3xl">
        <div className="relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by student, company, account, or department..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
          />
        </div>
        <select
          value={selectedDepartment}
          onChange={(event) => setSelectedDepartment(event.target.value)}
          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
        >
          {departments.map((department) => (
            <option key={department} value={department}>{department}</option>
          ))}
        </select>
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
                      <div className="text-xs text-slate-500">{payment.student_id || 'No Student ID'} | {payment.department || 'No Department'}</div>
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
