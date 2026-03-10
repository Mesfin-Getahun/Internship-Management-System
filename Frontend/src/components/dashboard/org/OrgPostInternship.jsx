import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { internships } from '../../../assets/data.js'; // Using absolute path
import EditableSkillsInput from '../../setup/EditableSkillsInput.jsx';

const OrgPostInternship = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editingId = searchParams.get('edit');

  const [isEditing, setIsEditing] = useState(!!editingId);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    location: '',
    type: 'On-site',
    duration: '',
    positions: '',
    deadline: '',
    slots: '',
    skills: [],
  });

  useEffect(() => {
    if (editingId) {
      const vacancyToEdit = internships.find(v => v.id === parseInt(editingId));
      if (vacancyToEdit) {
        setFormData({
          title: vacancyToEdit.title || '',
          field: vacancyToEdit.field || '',
          description: vacancyToEdit.description || '',
          location: vacancyToEdit.location || '',
          slots: vacancyToEdit.slots || '',
          skills: vacancyToEdit.skills || [],
        });
      } else {
        toast.error("Vacancy not found for editing.");
        navigate('/organization/vacancies');
      }
    }
  }, [editingId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (newSkills) => {
    setFormData({ ...formData, skills: newSkills });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.title || !formData.field || !formData.description || !formData.location || !formData.slots) {
      toast.warn('Please fill out all required fields.');
      return;
    }

    if (isEditing) {
      // Logic to update an existing internship
      console.log('Updating internship:', { id: editingId, ...formData });
      toast.success(`Vacancy "${formData.title}" has been updated!`);
    } else {
      // Logic to post a new internship
      console.log('Publishing new internship:', formData);
      toast.success(`Vacancy "${formData.title}" has been published!`);
    }
    
    // In a real app, you'd send this to an API
    // For now, just navigate back to vacancies
    navigate('/organization/vacancies');
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto pb-10">
      <ToastContainer
        position="top-right"
        autoClose={5000}
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
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          {isEditing ? 'Edit Internship Vacancy' : 'Post a New Internship Vacancy'}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {isEditing ? 'Update the details for the internship opportunity.' : 'Fill out the form below to announce a new opportunity.'}
        </p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Internship Title</label>
              <input name="title" value={formData.title} onChange={handleInputChange} type="text" placeholder="e.g. Junior Cloud Engineer" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Internship Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" placeholder="Outline the responsibilities, projects, and learning outcomes..." className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Required Skills (Comma separated)</label>
              <input name="skills" value={formData.skills} onChange={handleInputChange} type="text" placeholder="e.g. Python, Docker, React, AWS" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Location</label>
              <input name="location" value={formData.location} onChange={handleInputChange} type="text" placeholder="e.g. Addis Ababa / Remote" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Internship Type</label>
              <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>On-site</option>
                <option>Remote</option>
                <option>Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Duration (Months)</label>
              <input name="duration" value={formData.duration} onChange={handleInputChange} type="number" placeholder="3" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Number of Positions</label>
              <input name="positions" value={formData.positions} onChange={handleInputChange} type="number" placeholder="5" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 text-sm">Application Deadline</label>
              <input name="deadline" value={formData.deadline} onChange={handleInputChange} type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <div className="col-span-1 md:col-span-2">
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                {isEditing ? 'Update Vacancy' : 'Publish Internship'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrgPostInternship;
