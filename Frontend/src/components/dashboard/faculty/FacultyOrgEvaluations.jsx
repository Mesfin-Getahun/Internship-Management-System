import React, { useState, useMemo } from 'react';
import { Search, X, Star, Building, User, FileText } from 'lucide-react';

const mockEvaluations = [
  {
    id: 1,
    student: 'John Doe',
    type: 'Organization',
    target: 'Google',
    date: '2024-06-15',
    rating: 5,
    summary: 'Excellent internship experience. Great learning opportunities and supportive environment.',
    details: {
      'Clarity of Expectations': 5,
      'Quality of Supervision': 5,
      'Provided Resources': 4,
      'Skill Development': 5,
      'Overall Experience': 5,
      comments: 'The team at Google was fantastic. My supervisor provided clear goals and was always available for guidance. I learned a lot about large-scale system design.'
    }
  },
  {
    id: 2,
    student: 'Jane Smith',
    type: 'Mentor',
    target: 'Dr. Alan Turing',
    date: '2024-06-14',
    rating: 4,
    summary: 'Dr. Turing was very knowledgeable and helpful throughout the project.',
    details: {
      'Availability': 4,
      'Guidance': 5,
      'Communication': 4,
      'Encouragement': 5,
      'Overall Effectiveness': 4,
      comments: 'Dr. Turing provided excellent technical guidance. Sometimes it was a bit hard to schedule meetings, but he always made up for it with detailed email feedback.'
    }
  },
  {
    id: 3,
    student: 'Peter Jones',
    type: 'Organization',
    target: 'Microsoft',
    date: '2024-06-12',
    rating: 4,
    summary: 'Good experience, though the project scope was a bit vague initially.',
     details: {
      'Clarity of Expectations': 3,
      'Quality of Supervision': 4,
      'Provided Resources': 5,
      'Skill Development': 4,
      'Overall Experience': 4,
      comments: 'Microsoft has amazing resources for interns. The project I was on felt a little disorganized at the start, but my supervisor helped clarify things. I still learned a great deal.'
    }
  },
    {
    id: 4,
    student: 'Emily White',
    type: 'Mentor',
    target: 'Dr. Grace Hopper',
    date: '2024-06-10',
    rating: 5,
    summary: 'An outstanding mentor. Dr. Hopper was incredibly supportive and inspiring.',
    details: {
      'Availability': 5,
      'Guidance': 5,
      'Communication': 5,
      'Encouragement': 5,
      'Overall Effectiveness': 5,
      comments: 'I couldn\'t have asked for a better mentor. Dr. Hopper pushed me to do my best work and was a constant source of encouragement and wisdom. Her passion for the field is contagious.'
    }
  },
];

const EvaluationModal = ({ evaluation, onClose }) => {
  if (!evaluation) return null;

  const isOrg = evaluation.type === 'Organization';

  const renderStars = (rating) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={20} className={i < rating ? 'text-amber-400 fill-current' : 'text-slate-600'} />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-fade-in-fast">
      <div className="bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl m-4 border border-slate-700">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-3">
            <FileText size={20} /> Evaluation Details
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full bg-slate-700/50 hover:bg-slate-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start bg-slate-900 p-4 rounded-lg">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Student</p>
              <p className="text-lg font-bold text-white">{evaluation.student}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-semibold">Evaluation Target</p>
              <p className="text-lg font-bold text-white flex items-center justify-end gap-2">
                {isOrg ? <Building size={16} /> : <User size={16} />}
                {evaluation.target}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Detailed Ratings</p>
            <div className="space-y-3">
              {Object.entries(evaluation.details).map(([key, value]) => {
                if (key === 'comments') return null;
                return (
                  <div key={key} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
                    <p className="text-sm text-slate-300 font-medium">{key}</p>
                    {renderStars(value)}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Comments</p>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <p className="text-sm text-slate-300 italic">"{evaluation.details.comments}"</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/50 rounded-b-2xl text-center text-xs text-slate-500">
          Evaluation submitted on {new Date(evaluation.date).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};


const FacultyOrgEvaluations = () => {
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvaluations = useMemo(() => {
    return mockEvaluations
      .filter(e => filter === 'All' || e.type === filter)
      .filter(e => 
        e.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.target.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [filter, searchTerm]);

  const renderStars = (rating) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={16} className={i < rating ? 'text-amber-400 fill-current' : 'text-slate-600'} />
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6">
      <EvaluationModal evaluation={selectedEvaluation} onClose={() => setSelectedEvaluation(null)} />
      
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Student Evaluations</h2>
        <p className="text-slate-500 text-sm mt-1">Review feedback from organizations and academic mentors.</p>
      </header>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
          {['All', 'Organization', 'Mentor'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${
                filter === f 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search student or target..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvaluations.map(e => (
          <div key={e.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4 transition-all hover:shadow-lg hover:border-emerald-500/30">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">{e.student}</p>
                <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  {e.type === 'Organization' ? <Building size={14} className="text-slate-500" /> : <User size={14} className="text-slate-500" />}
                  {e.target}
                </p>
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded-md ${e.type === 'Organization' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'}`}>
                {e.type}
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{e.summary}"</p>
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {renderStars(e.rating)}
                <span className="text-xs font-bold text-slate-500">({e.rating}.0)</span>
              </div>
              <button 
                onClick={() => setSelectedEvaluation(e)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 text-xs font-bold py-2 px-3 rounded-lg transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      {filteredEvaluations.length === 0 && (
        <div className="text-center py-10">
          <p className="text-slate-500">No evaluations match your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default FacultyOrgEvaluations;