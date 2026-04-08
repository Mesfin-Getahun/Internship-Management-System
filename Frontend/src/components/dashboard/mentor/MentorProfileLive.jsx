import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faSpinner, faUserGraduate, faBriefcase } from '@fortawesome/free-solid-svg-icons';

const MentorProfileLive = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mentor/profile`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setProfile(res.data?.profile || null);
      } catch (error) {
        console.error('Failed to load mentor profile', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[320px] flex items-center justify-center text-teal-600 dark:text-teal-400">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    );
  }

  const mentorName = profile?.full_name || user?.full_name || user?.name || 'Mentor';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorName)}&background=0D9488&color=fff`;

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Mentor Profile</h2>
        <p className="text-slate-500 text-sm mt-1">Live account data for your mentorship portal access.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center gap-6">
          <img
            src={avatarUrl}
            alt="Mentor avatar"
            className="w-24 h-24 rounded-3xl object-cover border border-slate-200 dark:border-slate-700"
          />
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{mentorName}</h3>
            <p className="text-sm text-teal-600 dark:text-teal-400 font-bold uppercase tracking-widest mt-2">Academic Mentor</p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Contact Email</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <FontAwesomeIcon icon={faEnvelope} className="text-teal-600" />
              {profile?.email || 'Not available'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Phone Number</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <FontAwesomeIcon icon={faPhone} className="text-teal-600" />
              {profile?.phone_number || 'Not available'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Assigned Students</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <FontAwesomeIcon icon={faUserGraduate} className="text-teal-600" />
              {profile?.total_students ?? 0}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Active Internships</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <FontAwesomeIcon icon={faBriefcase} className="text-teal-600" />
              {profile?.active_internships ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfileLive;
