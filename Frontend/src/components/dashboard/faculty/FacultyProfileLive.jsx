import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faBuilding, faClock, faUsers, faFileAlt, faClipboardCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
      <Icon className="text-slate-500 dark:text-slate-400" size={20} />
    </div>
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">{label}</p>
      <p className="text-sm font-medium text-slate-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const StatCard = ({ value, label }) => (
  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-center">
    <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{value}</p>
    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">{label}</p>
  </div>
);

const FacultyProfileLive = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/profile`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setProfile(res.data?.profile || null);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load faculty profile.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchProfile();
    else {
      setLoading(false);
      setError('Faculty session token is missing. Please sign in again.');
    }
  }, [user?.token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-indigo-500">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      </div>
    );
  }

  if (error) {
    return <div className="text-slate-500 dark:text-slate-400">{error}</div>;
  }

  const avatarUrl = profile?.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.faculty_name || 'Faculty')}&background=0284c7&color=fff&size=128`;

  return (
    <div className="animate-fade-in space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Faculty Profile</h2>
        <p className="text-slate-500 text-sm mt-1">Your profile details are loaded from the faculty backend endpoint.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-8">
          <div className="flex flex-col sm:flex-row items-start gap-8">
            <img
              src={avatarUrl}
              alt="Faculty Avatar"
              className="w-32 h-32 rounded-full border-4 border-slate-200 dark:border-slate-700 shadow-md"
            />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{profile?.faculty_name}</h3>
              <p className="text-md font-semibold text-emerald-600 dark:text-emerald-400">{profile?.faculty_id}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{profile?.department || 'Faculty Department'}</p>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {profile?.bio || 'No biography is available for this faculty account yet.'}
              </p>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Contact & Office Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem icon={faEnvelope} label="Email Address" value={profile?.email || 'Not provided'} />
              <InfoItem icon={faPhone} label="Phone Number" value={profile?.phone_number || 'Not provided'} />
              <InfoItem icon={faBuilding} label="Office Location" value={profile?.office || 'Not provided'} />
              <InfoItem icon={faClock} label="Office Hours" value={profile?.office_hours || 'Not provided'} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Statistics</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              <StatCard value={profile?.students_mentored || 0} label="Students Mentored" />
              <StatCard value={profile?.total_reports || 0} label="Reports" />
              <StatCard value={profile?.total_evaluations || 0} label="Evaluations" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <InfoItem icon={faUsers} label="Faculty Students" value={profile?.total_students || 0} />
            <InfoItem icon={faFileAlt} label="Reports Collected" value={profile?.total_reports || 0} />
            <InfoItem icon={faClipboardCheck} label="Evaluations Collected" value={profile?.total_evaluations || 0} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfileLive;
