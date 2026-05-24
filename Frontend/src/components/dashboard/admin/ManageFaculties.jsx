import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const ManageFaculties = () => {
  const { user } = useAuth();
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    if (user?.token) {
      fetchFaculties();
    }
  }, [user?.token]);

  const fetchFaculties = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/faculties`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setFaculties(Array.isArray(res.data?.faculties) ? res.data.faculties : []);
    } catch (error) {
      console.error('Failed to load faculties.', error);
    }
  };

  const handleEdit = async (faculty) => {
    const nextName = window.prompt('Update faculty name', faculty.faculty_name);
    if (nextName === null) return;

    const nextEmail = window.prompt('Update faculty email', faculty.email || '');
    if (nextEmail === null) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/faculties/${encodeURIComponent(faculty.faculty_id)}`,
        {
          faculty_name: nextName.trim() || faculty.faculty_name,
          email: nextEmail.trim() || faculty.email,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      await fetchFaculties();
    } catch (error) {
      console.error('Failed to update faculty.', error);
    }
  };

  const handleDelete = async (faculty) => {
    if (String(faculty.status || '').toLowerCase() === 'inactive') return;

    const confirmed = window.confirm(`Deactivate faculty "${faculty.faculty_name}"? Historical data will remain available.`);
    if (!confirmed) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/faculties/${encodeURIComponent(faculty.faculty_id)}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      await fetchFaculties();
    } catch (error) {
      console.error('Failed to deactivate faculty.', error);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Faculty Management</h2>
          <p className="text-slate-500 text-sm mt-1 uppercase text-[10px] font-bold tracking-widest">Institutional Hierarchy Control</p>
        </div>
        <button className="px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 active:scale-95">
          <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
          Add New Faculty
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="p-5">Faculty Entity</th>
                <th className="p-5">Dean / Responsibility</th>
                <th className="p-5 text-center">Enrollment</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {faculties.map((f, i) => {
                const isActive = String(f.status || '').toLowerCase() === 'active';

                return (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5">
                    <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{f.faculty_name}</div>
                    <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-0.5">{f.faculty_id}</div>
                  </td>
                  <td className="p-5 text-slate-600 font-medium">{f.email || 'No faculty email'}</td>
                  <td className="p-5 text-center font-bold text-slate-700">{Number(f.total_students || 0).toLocaleString()}</td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => handleEdit(f)} className="p-2.5 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">
                          <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                       </button>
                       <button onClick={() => handleDelete(f)} disabled={!isActive} className="p-2.5 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all disabled:opacity-40">
                          <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageFaculties;
