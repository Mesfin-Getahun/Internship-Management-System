import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';

const UilRecommendationLetter = () => {
  const { user, recommendationLetter, refreshRecommendationLetter } = useAuth();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please select a PDF file to upload.');
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage('Uploading recommendation letter...');

      const formData = new FormData();
      formData.append('recommendationLetter', file);

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/UIL/recommendation-letter`,
        formData,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      );

      await refreshRecommendationLetter('uil');
      setMessage('Recommendation letter uploaded and made available to students.');
      setFile(null);

      if (document.getElementById('recommendation-letter-file')) {
        document.getElementById('recommendation-letter-file').value = '';
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Failed to upload recommendation letter.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMakeUnavailable = async () => {
    try {
      setIsSubmitting(true);
      setMessage('Removing recommendation letter...');

      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/UIL/recommendation-letter`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      );

      await refreshRecommendationLetter('uil');
      setMessage('Recommendation letter is no longer available to students.');
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Failed to remove recommendation letter.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          Recommendation Letter
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Upload a single UIL recommendation letter that students can view and download.
        </p>
      </header>

      <div className="max-w-3xl bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="recommendation-letter-file"
              className="block text-sm font-bold text-slate-700 mb-2"
            >
              Recommendation Letter PDF
            </label>
            <input
              type="file"
              id="recommendation-letter-file"
              onChange={handleFileChange}
              accept="application/pdf"
              className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Upload and Publish'}
          </button>
        </form>

        <div className="border-t border-slate-100 pt-8 space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Current Status</h3>
          <p
            className={`text-sm font-semibold ${
              recommendationLetter?.available ? 'text-green-600' : 'text-amber-600'
            }`}
          >
            {recommendationLetter?.available
              ? 'A recommendation letter is currently visible to students.'
              : 'No recommendation letter is currently visible to students.'}
          </p>

          {recommendationLetter?.available && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-sm text-slate-700 font-semibold">
                File: {recommendationLetter.file_name || 'Recommendation letter'}
              </p>
              {recommendationLetter.updated_at && (
                <p className="text-xs text-slate-500">
                  Last updated: {new Date(recommendationLetter.updated_at).toLocaleString()}
                </p>
              )}
              <div className="flex gap-3">
                <a
                  href={recommendationLetter.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold"
                >
                  Preview Letter
                </a>
                <button
                  type="button"
                  onClick={handleMakeUnavailable}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  Make Unavailable
                </button>
              </div>
            </div>
          )}
        </div>

        {message && (
          <p className="text-sm font-medium text-slate-500">{message}</p>
        )}
      </div>
    </div>
  );
};

export default UilRecommendationLetter;
