import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';

const AuthHeader = ({
  title = 'Internship & Performance Tracking',
  subtitle = 'Enter your credentials to access your dashboard',
}) => {
  return (
    <div className="pt-10 pb-2 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6 shadow-sm ring-4 ring-white dark:ring-slate-900">
        <FontAwesomeIcon icon={faLayerGroup} className="h-8 w-8" />
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
