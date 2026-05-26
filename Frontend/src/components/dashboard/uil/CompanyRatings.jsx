import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faBell, faCheckCircle, faSpinner, faStar } from '@fortawesome/free-solid-svg-icons';

const actionStyles = {
  warn: 'bg-amber-100 text-amber-700',
  appreciate: 'bg-emerald-100 text-emerald-700',
  ban: 'bg-red-100 text-red-700',
};

const CompanyRatings = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState('');
  const [message, setMessage] = useState('');

  const fetchRatings = async () => {
    if (!user?.token) return;

    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/UIL/company-ratings`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const nextCompanies = Array.isArray(res.data?.companies) ? res.data.companies : [];
      setCompanies(nextCompanies);
      setRatings(Array.isArray(res.data?.ratings) ? res.data.ratings : []);
      setSelectedCompanyId((current) => current || nextCompanies[0]?.company_id || null);
    } catch (error) {
      console.error('Failed to load company ratings:', error);
      setMessage(error.response?.data?.message || 'Failed to load company ratings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [user?.token]);

  const selectedCompany = useMemo(
    () => companies.find((company) => String(company.company_id) === String(selectedCompanyId)) || null,
    [companies, selectedCompanyId],
  );

  const selectedRatings = useMemo(
    () => ratings.filter((rating) => String(rating.company_id) === String(selectedCompanyId)),
    [ratings, selectedCompanyId],
  );

  const submitAction = async (action) => {
    if (!selectedCompanyId || !user?.token) return;

    try {
      setProcessing(action);
      setMessage('');
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/UIL/company-ratings/${encodeURIComponent(selectedCompanyId)}/action`,
        { action, note },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      setNote('');
      await fetchRatings();
      setMessage(action === 'ban' ? 'Company banned.' : action === 'warn' ? 'Warning recorded.' : 'Appreciation recorded.');
    } catch (error) {
      console.error('Failed to update company rating action:', error);
      setMessage(error.response?.data?.message || 'Failed to update company action.');
    } finally {
      setProcessing('');
    }
  };

  const getRecommendation = (company) => {
    const average = Number(company?.average_rating || 0);
    if (!company || company.rating_count === 0) return 'No ratings';
    if (average < 2.5) return 'Review for ban';
    if (average < 3.5) return 'Send warning';
    return 'Appreciate';
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Company Ratings</h2>
        <p className="text-slate-500 text-sm mt-1">Review student comments and take UIL action based on average rating.</p>
      </header>

      {message && (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl bg-white text-indigo-500">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        </div>
      ) : companies.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-3xl bg-white text-slate-500">
          No student company ratings have been submitted yet.
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Companies</p>
            </div>
            <div className="max-h-[680px] overflow-y-auto divide-y divide-slate-50">
              {companies.map((company) => {
                const active = String(company.company_id) === String(selectedCompanyId);
                const latestAction = company.latest_action?.action;

                return (
                  <button
                    type="button"
                    key={company.company_id}
                    onClick={() => setSelectedCompanyId(company.company_id)}
                    className={`w-full p-5 text-left transition-colors ${active ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-800">{company.company_name}</p>
                        <p className="mt-1 text-xs text-slate-400">{company.company_email || 'No email'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-800">{Number(company.average_rating || 0).toFixed(1)}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{company.rating_count} ratings</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {getRecommendation(company)}
                      </span>
                      {latestAction && (
                        <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${actionStyles[latestAction] || 'bg-slate-100 text-slate-500'}`}>
                          {latestAction}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-2xl font-black text-slate-800">{selectedCompany?.company_name || 'Company'}</p>
                <p className="mt-1 text-sm text-slate-500">{selectedCompany?.company_email || 'No email available'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-black uppercase tracking-widest text-indigo-700">
                    <FontAwesomeIcon icon={faStar} className="mr-2 text-amber-400" />
                    {Number(selectedCompany?.average_rating || 0).toFixed(1)} Average
                  </span>
                  <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-600">
                    {selectedCompany?.rating_count || 0} Comments
                  </span>
                </div>
              </div>
              <div className="min-w-0 lg:w-80">
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Optional UIL action note..."
                />
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => submitAction('warn')} disabled={Boolean(processing)} className="rounded-xl bg-amber-500 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-60">
                    <FontAwesomeIcon icon={processing === 'warn' ? faSpinner : faBell} spin={processing === 'warn'} className="mr-1" />
                    Warn
                  </button>
                  <button type="button" onClick={() => submitAction('appreciate')} disabled={Boolean(processing)} className="rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-60">
                    <FontAwesomeIcon icon={processing === 'appreciate' ? faSpinner : faCheckCircle} spin={processing === 'appreciate'} className="mr-1" />
                    Praise
                  </button>
                  <button type="button" onClick={() => submitAction('ban')} disabled={Boolean(processing)} className="rounded-xl bg-red-600 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-60">
                    <FontAwesomeIcon icon={processing === 'ban' ? faSpinner : faBan} spin={processing === 'ban'} className="mr-1" />
                    Ban
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {selectedRatings.map((rating) => (
                <article key={rating.rating_id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{rating.student_name || rating.student_id}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">{rating.internship_title || 'Internship'}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700">
                      <FontAwesomeIcon icon={faStar} className="text-amber-400" />
                      {rating.rating}/5
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{rating.comment || 'No comment provided.'}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default CompanyRatings;
