import React from 'react';

const LoginForm = ({ email, password, setEmail, setPassword, onSubmit, onRegisterOrg }) => {
  return (
    <form className="pt-8 pb-4 px-2" onSubmit={onSubmit}>
      <div className="mb-5">
        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2 text-sm">
          Email or Username
        </label>
        <input
          type="text"
          placeholder="welde@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div className="mb-4">
        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2 text-sm">
          Password
        </label>
        <input
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <button
        type="submit"
        className="w-full mt-2 py-3.5 bg-[#2563ff] text-white rounded-xl font-semibold hover:bg-blue-600 transition-all shadow-md active:scale-95 mb-4"
      >
        Sign In
      </button>

      <div className="text-center mb-6">
        <button
          type="button"
          className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline"
        >
          Forgot password?
        </button>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          New to the system?
          <button
            type="button"
            onClick={onRegisterOrg}
            className="ml-1 text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            Register Organization
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
