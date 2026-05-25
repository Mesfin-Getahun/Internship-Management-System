import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faDownload } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../../AuthContext';

const DataBackup = () => {
  const { user } = useAuth();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [progress, setProgress] = useState(0);
  const [backupHistory, setBackupHistory] = useState([]);

  const fetchBackups = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/backups`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setBackupHistory(Array.isArray(res.data?.backups) ? res.data.backups : []);
    } catch (error) {
      console.error('Failed to load backup history.', error);
    }
  };

  useEffect(() => {
    let timer;
    if (isBackingUp && progress < 100) {
      timer = setTimeout(() => setProgress(prev => prev + 1), 50);
    } else if (progress === 100) {
      setIsBackingUp(false);
      toast.success('Database backup completed successfully!');
    }
    return () => clearTimeout(timer);
  }, [isBackingUp, progress]);

  useEffect(() => {
    if (user?.token) {
      fetchBackups();
    }
  }, [user?.token]);

  const handleBackup = async () => {
    if (isBackingUp) return;
    setIsBackingUp(true);
    setProgress(0);
    toast.info('Starting database backup...');
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/backup`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      await fetchBackups();
    } catch (error) {
      console.error('Failed to create backup.', error);
      setIsBackingUp(false);
      setProgress(0);
      toast.error(error.response?.data?.message || 'Backup failed.');
    }
  };

  const handleDownload = (file) => {
    toast.info(`Backup file saved on server: ${file}`);
  };

  return (
    <div className="space-y-8">
      <ToastContainer theme="dark" position="bottom-right" />
      
      {/* Manual Backup Section */}
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">Manual Backup</h2>
        <p className="text-slate-400 mb-6">
          Create an instant backup of the entire system database. This process may take a few minutes.
        </p>
        {isBackingUp && (
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-base font-medium text-emerald-400">Backing up...</span>
              <span className="text-sm font-medium text-emerald-400">{progress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
        <button
          onClick={handleBackup}
          disabled={isBackingUp}
          className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 disabled:bg-slate-500 disabled:cursor-not-allowed"
        >
          <FontAwesomeIcon icon={faDatabase} size={18} />
          {isBackingUp ? 'Backup in Progress...' : 'Backup Now'}
        </button>
      </div>

      {/* Backup History Section */}
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">Backup History</h2>
        <p className="text-slate-400 mb-6">List of recent automated and manual backups.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800">
              <tr>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">File Size</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {backupHistory.map(backup => (
                <tr key={backup.id} className="bg-slate-800/50 border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="px-6 py-4 font-medium text-white">{backup.created_at ? new Date(backup.created_at).toLocaleString() : 'N/A'}</td>
                  <td className="px-6 py-4">{backup.file_size}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-900 text-emerald-300">
                      {backup.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleDownload(backup.file)} className="font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-2 mx-auto">
                      <FontAwesomeIcon icon={faDownload} size={16} /> Download Info
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataBackup;
