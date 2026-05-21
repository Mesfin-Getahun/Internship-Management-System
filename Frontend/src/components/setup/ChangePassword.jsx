import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import axios from 'axios';

const ChangePassword = () => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const getBackendRole = () => {
    switch (user?.role) {
      case 'organization':
        return 'company';
      case 'org_supervisor':
        return 'company_mentor';
      case 'uil':
        return 'UIL';
      default:
        return user?.role;
    }
  };

  const getAnyAvailableId = (...keys) => {
    for (const key of keys) {
      const value = user?.[key];
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
    return null;
  };

  const getUserId = () => {
    switch (user?.role) {
      case 'student':
        return getAnyAvailableId('student_id', 'id');
      case 'admin':
        return getAnyAvailableId('admin_id', 'id');
      case 'faculty':
        return getAnyAvailableId('faculty_id', 'id');
      case 'mentor':
        return getAnyAvailableId('mentor_id', 'id');
      case 'organization':
        return getAnyAvailableId('company_id', 'id');
      case 'uil':
        return getAnyAvailableId('UIL_id', 'uil_id', 'id');
      case 'org_supervisor':
        return getAnyAvailableId('company_mentor_id', 'id');
      default:
        return getAnyAvailableId(
          'student_id',
          'admin_id',
          'faculty_id',
          'mentor_id',
          'company_id',
          'UIL_id',
          'uil_id',
          'company_mentor_id',
          'id'
        );
    }
  };

  const getHomeRoute = (targetUser = user) => {
    if (!targetUser) {
      return "/login";
    }
    switch (targetUser.role) {
      case 'student': return '/student';
      case 'admin': return '/admin';
      case 'faculty': return '/faculty';
      case 'mentor': return '/mentor';
      case 'organization': return '/organization';
      case 'uil': return '/uil';
      case 'org_supervisor': return '/org-supervisor';
      default: return '/login';
    }
  };

  const normalizeRole = (role) => {
    switch (role) {
      case 'company':
        return 'organization';
      case 'UIL':
        return 'uil';
      case 'company_mentor':
        return 'org_supervisor';
      default:
        return role?.toLowerCase?.() || role;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwords.new.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match.');
      return;
    }

    const id = getUserId();
    const role = getBackendRole();

    if (!id || !role) {
      setError('Unable to identify your account. Please sign in again.');
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/change-password`, {
        id,
        role,
        currentPassword: passwords.current,
        newPassword: passwords.new,
        setupToken: user?.setupToken,
      }, {
        headers: user?.token
          ? { Authorization: `Bearer ${user.token}` }
          : undefined,
      });

      const reloginResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
        id: user?.email || String(id),
        email: user?.email || String(id),
        password: passwords.new,
      });

      if (!reloginResponse.data?.success) {
        throw new Error('Automatic re-login failed after password change.');
      }

      const normalizedRole = normalizeRole(reloginResponse.data.role);
      const authenticatedUser = {
        ...reloginResponse.data.user,
        role: normalizedRole,
        token: reloginResponse.data.token,
        isFirstLogin: false,
      };

      login(authenticatedUser);
      setSuccess('Password updated successfully. Redirecting...');
      setTimeout(() => {
        navigate(getHomeRoute(authenticatedUser));
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 transition-colors duration-300 p-8">
        <div className="animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Change Your Password</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">For security, please change your temporary password.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-slate-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-slate-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="block w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-slate-700"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            {success && <p className="text-sm text-green-600 text-center">{success}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? 'Updating...' : 'Set New Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
