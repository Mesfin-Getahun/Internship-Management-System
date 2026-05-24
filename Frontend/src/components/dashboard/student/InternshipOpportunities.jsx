import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faMapMarkerAlt, faClock, faTimes, faSpinner, faBuilding } from '@fortawesome/free-solid-svg-icons';

const formatDuration = (months) => {
  const parsed = Number.parseFloat(months);
  if (!Number.isFinite(parsed)) return 'Not specified';
  return `${parsed} month${parsed === 1 ? '' : 's'}`;
};

const InternshipOpportunities = () => {
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [currentInternship, setCurrentInternship] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true);
        const authConfig = {
          headers: { Authorization: `Bearer ${user?.token}` },
        };

        const [res, suggestedRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/internships`, authConfig),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/internships/suggested`, authConfig).catch(() => ({ data: { suggestions: [] } })),
        ]);

        // Some mapping might vary depending on backend exact response structure.
        // I will assume properties like title, company_name, location, end_date, description, skills, status.
        if (res.data.success && res.data.internships) {
           setOpportunities(res.data.internships);
        } else if (res.data.internships) {
           // fallback just in case 'success' isn't explicitly sent
           setOpportunities(res.data.internships);
        }
        setCurrentInternship(res.data?.current_internship || null);
        setSuggestions(Array.isArray(suggestedRes.data?.suggestions) ? suggestedRes.data.suggestions : []);
      } catch (err) {
        console.error("Failed to fetch opportunities:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchInternships();
  }, [user]);

  const filteredOpportunities = opportunities.filter((opp) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    return [
      opp.title,
      opp.company_name,
      opp.location,
      opp.description,
      opp.skills,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  const suggestionMap = new Map(
    suggestions.map((suggestion) => [String(suggestion.internship_id), suggestion]),
  );

  return (
    <div className="animate-fade-in space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Internship Opportunities</h2>
          <p className="text-slate-500 text-sm mt-1">Discover and apply for curated roles matching your BIT curriculum.</p>
        </div>
        <div className="w-full sm:w-auto flex gap-3">
          <div className="relative flex-grow sm:flex-none">
            <FontAwesomeIcon icon={faSearch} className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type="text" placeholder="Search roles..." className="w-full sm:w-64 pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </header>

      {currentInternship && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
          You already have a current internship{currentInternship.internship_title ? `: ${currentInternship.internship_title}` : ''}. New applications are disabled until it is completed
          {currentInternship.can_cancel_current_internship ? ' or you cancel it from Active Internship Status within the 7-day early cancellation window.' : '.'}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64 text-blue-500">
           <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl text-center shadow-sm">
           <FontAwesomeIcon icon={faBuilding} size="3x" className="text-slate-300 mb-4" />
           <p className="text-slate-500 font-bold">No listed opportunities available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredOpportunities.map((opp) => (
            <div key={opp.internship_id} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-black">
                  {opp.company_name?.charAt(0) || 'C'}
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700`}>
                  {suggestionMap.has(String(opp.internship_id)) ? `Match ${suggestionMap.get(String(opp.internship_id)).match_score}` : (opp.status || 'Active')}
                </span>
              </div>
              
              <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">{opp.title}</h4>
              <p className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">{opp.company_name}</p>
              
              <div className="flex gap-4 mb-8">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4" />
                  {opp.location || 'Not Specified'}
                </div>
                {opp.end_date && (
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                    <FontAwesomeIcon icon={faClock} className="h-4 w-4" />
                    Deadline: {new Date(opp.end_date).toLocaleDateString()}
                  </div>
                )}
              </div>

              <p className={`mb-4 text-xs font-bold ${opp.meets_duration_requirement ? 'text-emerald-600' : 'text-rose-600'}`}>
                Duration: {formatDuration(opp.duration_months || opp.duration)} | Required: {opp.required_minimum_months || 4} months
              </p>

              <div className="mb-4 flex flex-wrap gap-2">
                <span className={`rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                  opp.target_department_matched
                    ? 'bg-emerald-100 text-emerald-700'
                    : Array.isArray(opp.matched_profile_terms) && opp.matched_profile_terms.length > 0
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-slate-100 text-slate-600'
                }`}>
                  {opp.target_department_matched ? 'Department Match' : Array.isArray(opp.matched_profile_terms) && opp.matched_profile_terms.length > 0 ? 'Profile Match' : 'General Post'}
                </span>
                {Array.isArray(opp.matched_profile_terms) && opp.matched_profile_terms.length > 0 && (
                  <span className="rounded-lg bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-700">
                    {opp.matched_profile_terms.slice(0, 2).join(', ')}
                  </span>
                )}
              </div>

              {opp.application_locked && (
                <p className="mb-4 text-xs font-bold text-amber-600">
                  Applications locked: you already have a current internship.
                  {currentInternship?.can_cancel_current_internship ? ' You can cancel it from Active Internship Status if it is unsuitable.' : ''}
                </p>
              )}

              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 mb-8 flex-grow">
                {opp.description}
              </p>

              <button 
                onClick={() => setSelectedInternship(opp)}
                className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all active:scale-[0.98]"
              >
                View Details & Apply
              </button>
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full -mr-12 -mt-12"></div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedInternship && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedInternship(null)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex gap-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-xl shadow-blue-600/20">
                  {selectedInternship.company_name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">{selectedInternship.title}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-bold text-sm uppercase mt-1">{selectedInternship.company_name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedInternship(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8 flex-grow">
              <section>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">About the Role</h5>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm whitespace-pre-wrap">{selectedInternship.description}</p>
              </section>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Required Skills</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedInternship.skills || 'None explicitly specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Target Department</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedInternship.department || 'General / skill-based'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Duration</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {formatDuration(selectedInternship.duration_months || selectedInternship.duration)}
                  </p>
                  <p className={`text-xs font-bold ${selectedInternship.meets_duration_requirement ? 'text-emerald-600' : 'text-rose-600'}`}>
                    Your department requires at least {selectedInternship.required_minimum_months || 4} months.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Location</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedInternship.location || 'Not Specified'}</p>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                 <button 
                    onClick={() => navigate(`/student/apply/${selectedInternship.internship_id}`)}
                   disabled={!selectedInternship.meets_duration_requirement || selectedInternship.application_locked}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed">
                   {selectedInternship.application_locked ? 'Cancel Current Internship First' : selectedInternship.meets_duration_requirement ? 'Apply for this Position' : 'Duration Not Eligible'}
                 </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipOpportunities;
