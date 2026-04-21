import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFileLines } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../AuthContext';

const StudentRecommendationLetter = () => {
  const { recommendationLetter, refreshRecommendationLetter } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendationLetter = async () => {
      setLoading(true);
      await refreshRecommendationLetter('student');
      setLoading(false);
    };

    loadRecommendationLetter();
  }, [refreshRecommendationLetter]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-10">
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Checking for a recommendation letter from UIL...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Recommendation Letter
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Download the current recommendation letter published by the UIL office.
        </p>
      </header>

      <div className="max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8">
        {recommendationLetter?.available ? (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                <FontAwesomeIcon icon={faFileLines} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  A Recommendation Letter is Available
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  UIL has published a recommendation letter for students. You can open or download it below.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-5 space-y-2">
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                {recommendationLetter.file_name || 'Recommendation Letter'}
              </p>
              {recommendationLetter.updated_at && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Published: {new Date(recommendationLetter.updated_at).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <a
                href={recommendationLetter.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-xl transition-colors"
              >
                <FontAwesomeIcon icon={faDownload} />
                Download Letter
              </a>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">
              No Recommendation Letter Available
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              UIL has not published a recommendation letter yet. When one is uploaded, it will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRecommendationLetter;
