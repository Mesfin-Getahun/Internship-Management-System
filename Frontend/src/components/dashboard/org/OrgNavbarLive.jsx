import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';

const OrgNavbarLive = () => {
  const [profile, setProfile] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company/profile`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setProfile(res.data?.profile || null);
      } catch (err) {
        console.error(err);
      }
    };

    if (user?.token) {
      fetchProfile();
    }
  }, [user?.token]);

  const companyName = profile?.company_name || 'Organization';
  const status = String(profile?.status || 'pending').toLowerCase();
  const statusLabel = status === 'approved' ? 'Verified Partner' : 'Awaiting Verification';
  const statusDotClass = status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500';
  const statusTextClass = status === 'approved' ? 'text-emerald-500' : 'text-amber-500';
  const avatarUrl = profile?.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0D8ABC&color=fff`;

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20">
          {(companyName || 'O').charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-xl tracking-tight text-slate-800 dark:text-white leading-none">Organization</span>
          <span className="text-blue-600 font-bold text-xs uppercase tracking-widest mt-0.5">Partner Portal</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex flex-col items-end mr-2">
          <p className="text-sm font-bold text-slate-800 dark:text-white">{companyName}</p>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${statusDotClass}`}></span>
            <p className={`text-[10px] uppercase tracking-widest font-bold ${statusTextClass}`}>{statusLabel}</p>
          </div>
        </div>
        <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-800 p-0.5 ring-2 ring-blue-500/20 shadow-lg">
          <img
            className="w-full h-full rounded-full object-cover"
            src={avatarUrl}
            alt="Company Logo"
          />
        </div>
      </div>
    </nav>
  );
};

export default OrgNavbarLive;
