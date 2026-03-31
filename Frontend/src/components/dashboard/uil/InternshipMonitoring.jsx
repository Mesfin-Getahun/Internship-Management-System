import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faBuilding } from '@fortawesome/free-solid-svg-icons';

const InternshipDetailModal = ({ internship, onClose }) => {
    if (!internship) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full m-4 border border-slate-200">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">{internship.title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-all">
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>
                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Hosting Organization</p>
                        <p className="font-bold text-slate-700 flex items-center gap-2">
                           <FontAwesomeIcon icon={faBuilding} className="text-slate-400" />
                           {internship.company_name || internship.company_id?.company_name || 'Organization'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Location Details</p>
                        <p className="font-semibold text-slate-700">{internship.location || 'Not Specified'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Start Date</p>
                           <p className="font-bold text-slate-700">{internship.start_date ? new Date(internship.start_date).toLocaleDateString() : 'TBD'}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">End Date</p>
                           <p className="font-bold text-slate-700">{internship.end_date ? new Date(internship.end_date).toLocaleDateString() : 'TBD'}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Program Status</p>
                        <p className={`font-black uppercase text-sm ${internship.status === 'Approved' ? 'text-green-600' : internship.status === 'Pending' ? 'text-amber-500' : 'text-indigo-600'}`}>
                           {internship.status || 'Active'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InternshipMonitoring = () => {
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchInternships = async () => {
     try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/UIL/internships`);
        if (res.data.success) {
           setInternships(res.data.internships);
        } else if (res.data && Array.isArray(res.data)) {
           setInternships(res.data);
        }
     } catch (err) {
        console.error("Failed to fetch internships", err);
     } finally {
        setLoading(false);
     }
  };

  useEffect(() => {
     fetchInternships();
  }, []);

  const filteredInternships = internships.filter(i => 
      i.title.toLowerCase().includes(search.toLowerCase()) || 
      (i.company_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Internship Oversight</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time status tracking of all registered internship structural programs.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <input 
             type="text" 
             placeholder="Search title or company..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="flex-grow md:w-64 px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all" 
          />
          <button onClick={fetchInternships} className="px-6 py-3.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 shrink-0">
             Refresh
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
           <div className="flex flex-col justify-center items-center h-64 text-slate-400">
               <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mb-4 text-indigo-500" />
               <p className="font-bold">Aggregating program data...</p>
           </div>
        ) : filteredInternships.length === 0 ? (
           <div className="flex justify-center items-center h-64 text-slate-500">
               <p className="font-semibold">No active internship program entries spotted.</p>
           </div>
        ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                   <th className="p-5 whitespace-nowrap">Program Title</th>
                   <th className="p-5 whitespace-nowrap">Hosting Company</th>
                   <th className="p-5 whitespace-nowrap">Location</th>
                   <th className="p-5 whitespace-nowrap">Dates</th>
                   <th className="p-5 text-right whitespace-nowrap">Global Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 text-sm">
                 {filteredInternships.map((row, i) => (
                   <tr key={row.internship_id || i} onClick={() => setSelectedInternship(row)} className="hover:bg-indigo-50/50 transition-colors group cursor-pointer">
                     <td className="p-5">
                       <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{row.title}</div>
                       <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">ID: {row.internship_id ? row.internship_id.substring(0,8) : 'PROG'}</div>
                     </td>
                     <td className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">{row.company_name || row.company_id?.company_name || 'N/A'}</td>
                     <td className="p-5 text-slate-500 font-semibold text-xs">{row.location || 'Remote'}</td>
                     <td className="p-5 text-slate-500 text-[11px] font-bold">
                        <div>{row.start_date ? new Date(row.start_date).toLocaleDateString() : '-'}</div>
                        <div className="text-slate-400">to</div>
                        <div>{row.end_date ? new Date(row.end_date).toLocaleDateString() : '-'}</div>
                     </td>
                     <td className="p-5 text-right">
                       <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${
                          row.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-200' : 
                          row.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' : 
                          row.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-200' : 
                          'bg-indigo-50 text-indigo-700 border border-indigo-200'
                       }`}>
                         {row.status || 'Active'}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
      </div>
      <InternshipDetailModal internship={selectedInternship} onClose={() => setSelectedInternship(null)} />
    </div>
  );
};

export default InternshipMonitoring;
