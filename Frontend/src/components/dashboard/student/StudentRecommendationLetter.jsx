import React from 'react';
import { Download } from 'lucide-react';
import { useAuth } from '../../../AuthContext';

const StudentRecommendationLetter = () => {
  const { isRecommendationAvailable } = useAuth();

  const handleDownload = () => {
    // In a real app, this would be a direct link to the file on the server/CDN
    // For mock, we can just alert
    alert(`Downloading recommendation letter...`);
  };

  return (
    <div className="p-6 bg-slate-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Recommendation Letter</h2>
      <div className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-lg">
        {isRecommendationAvailable ? (
          <div>
            <h3 className="text-xl font-semibold mb-4">A Recommendation Letter is Available</h3>
            <p className="text-slate-300 mb-6">
              A general recommendation letter has been provided by the University Industry Linkage (UIL) office. You can download it by clicking the button below.
            </p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              <Download size={18} />
              Download Letter
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold mb-4">No Recommendation Letter Available</h3>
            <p className="text-slate-400">
              A recommendation letter has not been made available yet. Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRecommendationLetter;
