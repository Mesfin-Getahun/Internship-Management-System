import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardTeacher, faSpinner } from '@fortawesome/free-solid-svg-icons';
import NotificationBell from '../common/NotificationBell';

const MentorNavbar = () => {
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

  const mentorName = profile?.full_name || user?.full_name || user?.name || 'Mentor';
  const mentorSubtitle = profile?.email || 'Academic Mentor';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorName)}&background=0D9488&color=fff`;

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50 px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-600/20">
          <FontAwesomeIcon icon={faChalkboardTeacher} className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-xl tracking-tight text-slate-800 dark:text-white leading-none uppercase">BiT Mentor Portal</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 text-[10px] font-black rounded uppercase tracking-wider">Role: Academic Mentor</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Bahir Dar University</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell accent="teal" />

        <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">
              {loading ? 'Loading mentor...' : mentorName}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider">
              {loading ? 'Profile sync' : mentorSubtitle}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-teal-500/20 overflow-hidden shadow-md group cursor-pointer hover:border-teal-500 transition-colors">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-teal-600 dark:text-teal-400">
                <FontAwesomeIcon icon={faSpinner} spin className="h-4 w-4" />
              </div>
            ) : (
              <img
                src={avatarUrl}
                alt="Mentor Avatar"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MentorNavbar;
