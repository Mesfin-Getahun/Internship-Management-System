import React from 'react';

const PlaceholderScreen = ({ title }) => (
  <div className="flex items-center justify-center h-full text-gray-500">
    <div className="text-center">
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="mt-2">This page is under construction.</p>
    </div>
  </div>
);

export const MonitorApplications = () => <PlaceholderScreen title="Monitor Applications" />;
export const ApprovePlacements = () => <PlaceholderScreen title="Approve Placements" />;
