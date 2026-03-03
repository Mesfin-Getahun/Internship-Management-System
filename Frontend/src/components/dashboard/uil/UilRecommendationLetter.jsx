import React, { useState } from 'react';
import { useAuth } from '../../../AuthContext';

const UilRecommendationLetter = () => {
  const { isRecommendationAvailable, makeRecommendationAvailable, makeRecommendationUnavailable } = useAuth();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    setMessage('Uploading...');
    // Simulate API call
    setTimeout(() => {
      makeRecommendationAvailable();
      setMessage(`Recommendation letter uploaded and made available to all students.`);
      setFile(null);
      // also reset the file input
      if(document.getElementById('file')) {
        document.getElementById('file').value = '';
      }
    }, 1500);
  };

  const handleMakeUnavailable = () => {
    setMessage('Making letter unavailable...');
    // Simulate API call
    setTimeout(() => {
      makeRecommendationUnavailable();
      setMessage('Recommendation letter is no longer available to students.');
    }, 1000);
  };

  return (
    <div className="p-6 bg-slate-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Manage Recommendation Letter for All Students</h2>
      <div className="max-w-lg mx-auto bg-slate-800 p-8 rounded-lg">
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-6">
            <label htmlFor="file" className="block text-sm font-medium text-slate-300 mb-2">
              Recommendation Letter (PDF)
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              accept="application/pdf"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Upload and Make Available
          </button>
        </form>
        
        <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-semibold mb-2">Current Status</h3>
            <p className={`text-sm ${isRecommendationAvailable ? 'text-green-400' : 'text-yellow-400'}`}>
                {isRecommendationAvailable ? 'A recommendation letter is currently available to all students.' : 'No recommendation letter is currently available.'}
            </p>
            {isRecommendationAvailable && (
                 <button
                    onClick={handleMakeUnavailable}
                    className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                    Make Unavailable
                </button>
            )}
        </div>

        {message && <p className="mt-4 text-center text-sm text-slate-400">{message}</p>}
      </div>
    </div>
  );
};

export default UilRecommendationLetter;
