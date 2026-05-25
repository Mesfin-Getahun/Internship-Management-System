import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../AuthContext';
import NotificationBell from '../common/NotificationBell';
import DashboardMenuButton from '../common/DashboardMenuButton';

const AdminNavbar = ({ title, onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/profile`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setProfile(res.data?.profile || null);
      } catch (error) {
        console.error('Failed to load admin profile.', error);
      }
    };

    if (user?.token) {
      fetchProfile();
    }
  }, [user?.token]);

  const adminName = profile?.full_name || user?.full_name || user?.name || user?.email || 'Admin Super';
  const adminSubtitle = profile?.email || user?.email || 'Global Administrator';

  const routeMap = useMemo(() => ([
    { keywords: ['overview', 'dashboard', 'home', 'stats'], path: '/admin/overview' },
    { keywords: ['backup', 'data', 'export'], path: '/admin/data-backup' },
    { keywords: ['log', 'logs', 'audit'], path: '/admin/logs' },
    { keywords: ['monitor', 'monitoring', 'platform', 'maintenance'], path: '/admin/monitoring' },
  ]), []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchValue.trim().toLowerCase();
    if (!query) return;

    const match = routeMap.find((entry) =>
      entry.keywords.some((keyword) => query.includes(keyword))
    );

    if (match) {
      navigate(match.path);
    }
  };

  return (
    <nav className="fixed top-0 left-0 lg:left-64 right-0 h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 z-50 px-4 sm:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3 sm:gap-6 lg:gap-8 flex-grow min-w-0">
        <DashboardMenuButton onClick={onMenuClick} />
        <h1 className="text-base sm:text-xl font-black text-slate-800 tracking-tight uppercase truncate">{title}</h1>
        
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg hidden lg:block">
          <FontAwesomeIcon icon={faSearch} className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            type="text" 
            placeholder="Search system sections like logs, backup, monitoring..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </form>
      </div>
      
      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
           <span className="w-2 h-2 rounded-full bg-green-500"></span>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sys OK</span>
        </div>

        <NotificationBell accent="indigo" />
        
        <div className="h-10 w-px bg-slate-200 mx-2"></div>
        
        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">{adminName}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{adminSubtitle}</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-slate-900 border-2 border-indigo-500/20 overflow-hidden shadow-sm group-hover:border-indigo-500 transition-all">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=1e293b&color=fff`} 
              alt="Admin Avatar" 
              className="w-full h-full object-cover opacity-90"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
