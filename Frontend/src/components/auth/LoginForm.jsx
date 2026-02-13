
import React from 'react';

const LoginForm = ({ role, email, password, setEmail, setPassword, onSubmit, onBackToRoles, onRegisterOrg }) => {
  const displayRole = role?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const isAcademicRole = ['student', 'mentor', 'faculty'].includes(role?.toLowerCase());

  return (
    <form className="p-8" onSubmit={onSubmit}>
      <p className="text-slate-400 dark:text-slate-500 text-sm mb-6 text-center">
        Enter your credentials to access your {displayRole} dashboard
      </p>
      
      {isAcademicRole && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              <span className="font-bold">First time logging in?</span> Use your University ID as your username. Default password is provided by your department.
            </p>
          </div>
        </div>
      )}
      
      <div className="mb-5">
        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2 text-sm">Email or Username</label>
        <input 
          type="text" 
          placeholder="e.g. ID/2023/1234"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div className="mb-6">
        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2 text-sm">Password</label>
        <input 
          type="password" 
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <button 
        type="submit"
        className="w-full py-4 bg-slate-800 dark:bg-blue-600 text-white rounded-xl font-bold hover:bg-slate-900 dark:hover:bg-blue-500 transition-all shadow-lg active:scale-95 mb-6"
      >
        Sign In as {displayRole}
      </button>

      <div className="text-center">
        <a href="#" className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline">Forgot password?</a>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {role === 'organization' ? "Not registered?" : "New to the system?"}
          <button 
            type="button"
            onClick={role === 'organization' ? onRegisterOrg : onBackToRoles}
            className="ml-1 text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            {role === 'organization' ? 'Register Company' : 'View Instructions'}
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
