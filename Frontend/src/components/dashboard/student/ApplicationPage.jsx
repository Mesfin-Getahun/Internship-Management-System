import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ApplicationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cv, setCv] = useState(null);
  const [letter, setLetter] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cv || !letter) {
      alert('Please upload both your CV and a recommendation letter.');
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log(`Submitting application for internship ${id} with files:`, {
        cv: cv.name,
        letter: letter.name,
      });
      setIsSubmitting(false);
      alert('Application submitted successfully! You will be redirected to your applications.');
      navigate('/student/my-applications');
    }, 1500);
  };

  return (
    <div className="animate-fade-in p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Apply for Internship</h2>
        <p className="text-slate-500 text-sm mt-1">Submit your documents for the selected opportunity.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Upload CV (PDF, DOCX)
            </label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => handleFileChange(e, setCv)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            {cv && <p className="text-xs text-slate-500 mt-2">Selected: {cv.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Upload Recommendation Letter (PDF, DOCX)
            </label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => handleFileChange(e, setLetter)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            {letter && <p className="text-xs text-slate-500 mt-2">Selected: {letter.name}</p>}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:bg-slate-400 disabled:shadow-none"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationPage;
