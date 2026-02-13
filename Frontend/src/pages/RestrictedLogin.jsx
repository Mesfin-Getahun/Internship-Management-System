
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const RestrictedLogin = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const displayRole = role?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'uil-officer') {
      navigate('/dashboard/uil-officer');
    } else if (role === 'system-admin') {
      navigate('/dashboard/system-admin');
    } else {
      console.log('Authenticating restricted role:', role);
      alert('Authentication successful for ' + displayRole);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 selection:bg-blue-900/50">
      <div className="max-w-md w-full bg-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700 overflow-hidden transition-all duration-500 animate-fade-in">
        <div className="p-10 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-700 text-blue-400 mb-8 shadow-inner border border-slate-600">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{displayRole}</h2>
            <p className="text-slate-400 font-medium mt-3 text-sm tracking-wide">Secure Restricted Access Portal</p>
        </div>

        <form className="p-10" onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-slate-400 font-bold mb-2 text-xs uppercase tracking-widest">Administrative Email</label>
            <input 
              type="email" 
              placeholder="admin@bit.edu.et"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-900 text-white placeholder:text-slate-600"
              required
            />
          </div>

          <div className="mb-10">
            <label className="block text-slate-400 font-bold mb-2 text-xs uppercase tracking-widest">Security Key</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-900 text-white placeholder:text-slate-600"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-xl active:scale-95 mb-4"
          >
            Authenticate Access
          </button>
        </form>

        <div className="px-10 pb-10 text-center">
            <div className="p-4 bg-red-900/20 border border-red-900/30 rounded-xl">
              <p className="text-red-400/80 text-[10px] uppercase font-bold tracking-tighter leading-tight">
                Unauthorized access attempts are monitored and recorded by system security protocols.
              </p>
            </div>
        </div>
      </div>
      <button onClick={() => navigate('/')} className="mt-8 text-slate-500 hover:text-slate-300 flex items-center text-sm font-bold transition-colors">
        &larr; Return to Public Portal
      </button>
    </div>
  );
};

export default RestrictedLogin;
