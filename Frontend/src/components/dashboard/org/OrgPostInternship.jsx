import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';

const getDateOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const OrgPostInternship = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const editingId = searchParams.get('edit');

  const isEditing = !!editingId;
  const [loadingContext, setLoadingContext] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    department: '',
    location: '',
    start_date: '',
    end_date: '',
  });

  const tomorrow = getDateOffset(1);

  useEffect(() => {
    // If editing, attempt to pre-fetch the existing listing
    if (editingId && user?.token) {
      const fetchInternshipDetails = async () => {
         try {
            setLoadingContext(true);
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company/activeInternships`, {
               headers: { Authorization: `Bearer ${user.token}` }
            });
            const allInternships = res.data.internships || res.data || [];
            const target = allInternships.find(v => (v.internship_id || v.id).toString() === editingId.toString());
            
            if (target) {
               if (target.is_locked || target.can_edit === false) {
                  toast.warn("This vacancy cannot be edited because a student has already applied or been accepted.");
                  navigate('/organization/vacancies');
                  return;
               }

               setFormData({
                  title: target.title || '',
                  description: target.description || '',
                  requirements: target.requirements || '',
                  department: target.department || '',
                  location: target.location || '',
                  start_date: target.start_date ? String(target.start_date).slice(0, 10) : '',
                  end_date: target.end_date ? String(target.end_date).slice(0, 10) : '',
               });
            } else {
               toast.warn("Vacancy not found for editing.");
               navigate('/organization/vacancies');
            }
         } catch (err) {
            console.error("Failed to load vacancy details", err);
            toast.error("Error loading vacancy details.");
         } finally {
            setLoadingContext(false);
         }
      };
      fetchInternshipDetails();
    }
  }, [editingId, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.start_date || !formData.end_date) {
      toast.warn('Please fill out the title, description, start date, and end date.');
      return;
    }

    if (formData.start_date <= getDateOffset(0)) {
      toast.warn('Start date must be a future date.');
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      toast.warn('End date cannot be before start date.');
      return;
    }

    try {
       setLoadingContext(true);
       if (isEditing) {
          // PUT mapping
          await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/company/updateInternship/${editingId}`, formData, {
             headers: { Authorization: `Bearer ${user?.token}` }
          });
          toast.success(`Vacancy "${formData.title}" has been updated!`);
       } else {
          // POST mapping
          await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/company/postInternship`, formData, {
             headers: { Authorization: `Bearer ${user?.token}` }
          });
          toast.success(`Vacancy "${formData.title}" has been published!`);
       }
       // Delay navigation slightly so the toast renders
       setTimeout(() => {
          navigate('/organization/vacancies');
       }, 1500);
    } catch (error) {
       console.error(error);
       toast.error(error.response?.data?.message || 'Error occurred while saving the vacancy.');
    } finally {
       setLoadingContext(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto pb-10">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
          {isEditing ? 'Edit Internship Vacancy' : 'Post Internship Vacancy'}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {isEditing ? 'Update the details for the existing internship listing.' : 'Fill out the form below to announce a new opportunity to university students.'}
        </p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">Internship Title *</label>
              <input name="title" value={formData.title} onChange={handleInputChange} type="text" placeholder="e.g. Junior Cloud Engineer" required className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold" />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">About the Role *</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="5" placeholder="Outline the responsibilities, projects, and learning outcomes..." required className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all leading-relaxed"></textarea>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">Requirements</label>
              <textarea name="requirements" value={formData.requirements} onChange={handleInputChange} rows="3" placeholder="Expected skills, programming languages, previous coursework..." className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all leading-relaxed"></textarea>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">Target Department</label>
              <input name="department" value={formData.department} onChange={handleInputChange} type="text" placeholder="e.g. Computer Science, Information Technology, Software Engineering" className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Leave blank only if the vacancy is open to any department with matching skills.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">Start Date *</label>
              <input name="start_date" value={formData.start_date} onChange={handleInputChange} type="date" min={tomorrow} required className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold" />
            </div>

            <div className="space-y-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">End Date *</label>
              <input name="end_date" value={formData.end_date} onChange={handleInputChange} type="date" min={formData.start_date || tomorrow} required className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold" />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">Location</label>
              <input name="location" value={formData.location} onChange={handleInputChange} type="text" placeholder="e.g. Addis Ababa / Remote" className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold" />
            </div>
          </div>

          <div className="flex gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
             <button
               type="button"
               disabled={loadingContext}
               onClick={() => navigate('/organization/vacancies')}
               className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
             >
                Cancel
             </button>
             <button
               type="submit"
               disabled={loadingContext}
               className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
             >
                {loadingContext ? 'Processing...' : (isEditing ? 'Update Vacancy' : 'Publish Internship')}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrgPostInternship;
