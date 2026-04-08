import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faFileAlt, faUsers, faInfoCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

const colorStyles = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
};

const OrgOverviewLive = () => {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        setError('');
        const authConfig = {
          headers: { Authorization: `Bearer ${user?.token}` },
        };

        const [profileRes, applicationsRes, internshipsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company/profile`, authConfig),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company/getApplications`, authConfig),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company/activeInternships`, authConfig),
        ]);

        setProfile(profileRes.data?.profile || null);
        setApplications(Array.isArray(applicationsRes.data?.applications) ? applicationsRes.data.applications : []);
        setInternships(Array.isArray(internshipsRes.data?.internships) ? internshipsRes.data.internships : []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load organization dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchOverviewData();
    } else {
      setLoading(false);
      setError('Organization session token is missing. Please sign in again.');
    }
  }, [user?.token]);

  const summary = useMemo(() => {
    const activeVacancies = internships.length;
    const totalApplications = applications.length;
    const currentInterns = internships.reduce(
      (sum, internship) => sum + Number(internship.active_students || 0),
      0,
    );

    return {
      activeVacancies,
      totalApplications,
      currentInterns,
    };
  }, [applications, internships]);

  const stats = [
    { label: 'Active Vacancies', val: summary.activeVacancies, color: 'blue', icon: faBriefcase },
    { label: 'Total Applications', val: summary.totalApplications, color: 'emerald', icon: faFileAlt },
    { label: 'Current Interns', val: summary.currentInterns, color: 'amber', icon: faUsers },
  ];

  const recentApplications = applications.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          {`Good Morning, ${profile?.company_name || 'Organization'}`}
        </h2>
        <p className="text-slate-500 text-sm mt-1">Here is what&apos;s happening with your internship programs today.</p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-blue-500">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 text-slate-500 dark:text-slate-400">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-4xl font-black mt-2 text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{stat.val}</p>
                  </div>
                  <div className={`p-3 rounded-2xl ${colorStyles[stat.color]}`}>
                    <FontAwesomeIcon icon={stat.icon} className="h-6 w-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800/30 p-6 rounded-3xl flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
              <FontAwesomeIcon icon={faInfoCircle} className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 dark:text-amber-400">
                {profile?.status === 'approved' ? 'Verified Partner Account' : 'Account Verification in Progress'}
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-500/80 max-w-2xl leading-relaxed">
                {profile?.status === 'approved'
                  ? 'Your organization is approved and your internships can be reviewed by students.'
                  : 'UIL officers are currently validating your documentation. During this phase, you can create and manage vacancy drafts, but they may not yet be visible to students.'}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Student Applications</h3>
              <button
                onClick={() => navigate('/organization/applications')}
                className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
              >
                View All Applications
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentApplications.length === 0 ? (
                <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
                  No student applications have been submitted yet.
                </div>
              ) : (
                recentApplications.map((app) => (
                  <div
                    key={app.application_id}
                    className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    onClick={() => navigate('/organization/applications')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform">
                        {(app.student_name || 'S').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">{app.student_name || 'Anonymous Student'}</p>
                        <p className="text-xs text-slate-500 font-medium">{app.internship_title || 'Internship Application'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-blue-600 dark:text-blue-400">{app.status || 'Pending'}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">
                        {app.applied_date ? new Date(app.applied_date).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrgOverviewLive;
