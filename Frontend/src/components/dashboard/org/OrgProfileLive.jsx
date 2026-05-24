import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faFilePdf, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons';

const OrgProfileLive = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    company_type: '',
    industry: '',
    email: '',
    phone_number: '',
    website: '',
    location: '',
    city: '',
    region: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company/profile`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const nextProfile = res.data?.profile || null;
        setProfile(nextProfile);
        setFormData({
          company_name: nextProfile?.company_name || '',
          company_type: nextProfile?.company_type || '',
          industry: nextProfile?.industry || '',
          email: nextProfile?.email || '',
          phone_number: nextProfile?.phone_number || '',
          website: nextProfile?.website || '',
          location: nextProfile?.location || '',
          city: nextProfile?.city || '',
          region: nextProfile?.region || '',
          password: '',
        });
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Failed to load organization profile.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchProfile();
    }
  }, [user?.token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/company/updateProfile`,
        formData,
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );
      toast.success('Company profile updated successfully.');
      setFormData((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update organization profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Deactivate this company account? You can only do this when no students are currently attending internship at your company.',
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/company/account`,
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );
      toast.success('Company account deactivated. Historical records remain available to the university.');
      logout();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to deactivate company account.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading profile...</div>;
  }

  return (
    <div className="animate-fade-in space-y-8 max-w-4xl mx-auto pb-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Organization Profile</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your company information through the live company profile routes.</p>
        </div>
        <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-200 dark:border-green-800/30">
          {profile?.account_status === 'inactive' ? 'Inactive' : profile?.status || 'Partner'}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">General Information</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Organization Name</label>
                  <input name="company_name" type="text" value={formData.company_name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Organization Type</label>
                  <input name="company_type" type="text" value={formData.company_type} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Industry Type</label>
                  <input name="industry" type="text" value={formData.industry} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Official Email</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                  <input name="phone_number" type="text" value={formData.phone_number} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Website</label>
                  <input name="website" type="text" value={formData.website} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Region</label>
                  <input name="region" type="text" value={formData.region} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">City</label>
                  <input name="city" type="text" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Address / Location</label>
                  <input name="location" type="text" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                  <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current password" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <button disabled={saving} className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                {saving ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600 text-white rounded-3xl p-8 shadow-xl shadow-blue-600/20 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-2">Partner Badge</h4>
              <p className="text-blue-100 text-xs leading-relaxed mb-6">Your organization profile is now loaded from the company backend profile route.</p>
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <FontAwesomeIcon icon={faCheckCircle} className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4">Official Documents</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faFilePdf} className="h-5 w-5 text-red-500" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Business License</span>
                </div>
                {profile?.license_url ? (
                  <a href={profile.license_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-[10px] uppercase">View</a>
                ) : (
                  <span className="text-slate-400 text-[10px] font-bold uppercase">N/A</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-100 dark:border-red-900/40 p-8 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-white mb-3">Account</h4>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 mb-5">
              Deactivation is allowed only when no students are currently attending internship here.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white font-black hover:bg-red-700 disabled:opacity-60"
            >
              <FontAwesomeIcon icon={deleting ? faSpinner : faTrash} spin={deleting} />
              {deleting ? 'Checking...' : 'Deactivate Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgProfileLive;
