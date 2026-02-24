import React from 'react';

const AuthHeader = ({
  title = 'Internship & Performance Tracking',
  subtitle = 'Enter your credentials to access your dashboard',
}) => {
  return (
    <div className="pt-10 pb-2 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6 shadow-sm ring-4 ring-white dark:ring-slate-900">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-slate-600 dark:text-slate-100 tracking-tight">
        {title}
      </h2>
      <p className="text-slate-400 dark:text-slate-400 font-medium mt-2 text-sm max-w-xs mx-auto">
        {subtitle}
      </p>
    </div>
  );
};

export default AuthHeader;
