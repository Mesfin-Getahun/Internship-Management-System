import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';

const ApplicationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [cv, setCv] = useState(null);
  const [academicDoc, setAcademicDoc] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cv || !academicDoc) {
      alert('Please upload both your CV and an academic document.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('cv', cv);
      formData.append('academic_doc', academicDoc);

      const response = await axios.post(
         `${import.meta.env.VITE_BACKEND_URL}/api/student/applyInternship/${id}`, 
         formData,
         {
            headers: {
               'Content-Type': 'multipart/form-data',
               Authorization: `Bearer ${user?.token}`
            }
         }
      );
      
      if (response.data.success) {
         alert('Application submitted successfully!');
         navigate('/student/my-applications');
      } else {
         alert('Failed to submit application: ' + response.data.message);
      }
    } catch (error) {
       console.error("Submission Error", error);
       alert(error.response?.data?.message || 'Error communicating with the server. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
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
              Upload CV (PDF)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileChange(e, setCv)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            {cv && <p className="text-xs text-slate-500 mt-2">Selected: {cv.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Upload Academic Record (PDF)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileChange(e, setAcademicDoc)}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            {academicDoc && <p className="text-xs text-slate-500 mt-2">Selected: {academicDoc.name}</p>}
          </div>

          <div className="pt-4 flex gap-4">
             <button
               type="button"
               disabled={isSubmitting}
               onClick={() => navigate(-1)}
               className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all font-inter"
             >
               Cancel
             </button>
             <button
               type="submit"
               disabled={isSubmitting}
               className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:bg-slate-400 disabled:shadow-none font-inter"
             >
               {isSubmitting ? 'Uploading Documents...' : 'Submit Application'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationPage;
