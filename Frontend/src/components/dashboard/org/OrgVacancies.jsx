import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PlusCircle, Edit, Trash2, ChevronDown, ChevronUp, MapPin, Users } from 'lucide-react';
import { internships as initialInternships } from '../../../assets/data.js';

const OrgVacancies = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState(initialInternships);
  const [expandedId, setExpandedId] = useState(null);

  const handleToggleDetails = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = (e, id, title) => {
    e.stopPropagation(); // Prevent the card from toggling when the button is clicked
    if (window.confirm(`Are you sure you want to delete the vacancy "${title}"?`)) {
      setInternships(prev => prev.filter(internship => internship.id !== id));
      toast.success(`Vacancy "${title}" has been deleted.`);
    }
  };
  
  const handleEdit = (e, id) => {
    e.stopPropagation(); // Prevent the card from toggling
    navigate(`/organization/post-internship?edit=${id}`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Internship Vacancies</h2>
          <p className="text-slate-500 text-sm mt-1">Review, edit, or remove existing internship opportunities.</p>
        </div>
        <Link
          to="/organization/post-internship"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md active:scale-95"
        >
          <PlusCircle size={20} />
          Post New Vacancy
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {internships.map(internship => (
          <div 
            key={internship.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 flex flex-col"
          >
            <div className="p-5 cursor-pointer flex-grow" onClick={() => handleToggleDetails(internship.id)}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{internship.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{internship.field}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                   <button title="Edit" onClick={(e) => handleEdit(e, internship.id)} className="p-2 text-blue-600 hover:bg-blue-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-full transition-colors"><Edit size={18} /></button>
                   <button title="Delete" onClick={(e) => handleDelete(e, internship.id, internship.title)} className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-slate-800 rounded-full transition-colors"><Trash2 size={18} /></button>
                   <div className="p-2 text-slate-500">
                     {expandedId === internship.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                   </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <MapPin size={16} />
                  <span>{internship.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Users size={16} />
                  <span>{internship.slots} Slots</span>
                </div>
              </div>
            </div>
            {expandedId === internship.id && (
              <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 animate-fade-in-fast">
                <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Description</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {internship.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrgVacancies;
