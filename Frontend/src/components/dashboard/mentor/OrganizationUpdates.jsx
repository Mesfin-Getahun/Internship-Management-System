import React, { useState } from 'react';
import { User, Building, Star, FileText, X } from 'lucide-react';

const mockStudents = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Peter Jones' },
];

const mockOrgEvaluations = {
  '1': {
    studentName: 'John Doe',
    company: 'Google',
    supervisor: 'Sundar Pichai',
    date: '2024-06-25',
    finalGrade: 38.57,
    attendance: { totalAbsent: 2, mark: 8 },
    performance: {
      totalMark: 65,
      scores: {
        'Grooming': { score: 2, weight: 2 },
        'Work Attitude': { score: 2, weight: 2 },
        'Consistency': { score: 2, weight: 2 },
        'Self Confidence': { score: 2, weight: 2 },
        'Communication Skills': { score: 1, weight: 2 },
        'Quality Work/Accuracy': { score: 2, weight: 2 },
        'Engagement': { score: 2, weight: 2 },
        'Creativity/Innovation': { score: 1, weight: 2 },
        'Independent Potential': { score: 2, weight: 2 },
        'Teamwork': { score: 2, weight: 2 },
        'Technical skills': { score: 4, weight: 4 },
        'Organization skills': { score: 3, weight: 4 },
        'Coordination skills': { score: 4, weight: 4 },
        'Responsibility Skills': { score: 4, weight: 4 },
        'Problem solving Skills': { score: 3, weight: 4 },
      }
    },
    comments: "John was a great asset to the team. He's a quick learner and very proactive. His communication could be slightly more concise in meetings, but his technical skills are top-notch."
  },
  '2': {
    studentName: 'Jane Smith',
    company: 'Microsoft',
    supervisor: 'Satya Nadella',
    date: '2024-06-26',
    finalGrade: 40.00,
    attendance: { totalAbsent: 0, mark: 10 },
    performance: {
      totalMark: 70,
      scores: Object.fromEntries(Object.entries({
        'Grooming': { weight: 2 }, 'Work Attitude': { weight: 2 }, 'Consistency': { weight: 2 }, 'Self Confidence': { weight: 2 }, 'Communication Skills': { weight: 2 },
        'Quality Work/Accuracy': { weight: 2 }, 'Engagement': { weight: 2 }, 'Creativity/Innovation': { weight: 2 }, 'Independent Potential': { weight: 2 }, 'Teamwork': { weight: 2 },
        'Technical skills': { weight: 4 }, 'Organization skills': { weight: 4 }, 'Coordination skills': { weight: 4 }, 'Responsibility Skills': { weight: 4 }, 'Problem solving Skills': { weight: 4 },
      }).map(([key, val]) => [key, { score: val.weight, weight: val.weight }])),
    },
    comments: "Jane exceeded all expectations. She is a natural leader and an exceptional engineer. We would hire her full-time in a heartbeat. No critiques."
  },
};

const EvaluationModal = ({ evaluation, onClose }) => {
    if (!evaluation) return null;

    const renderStars = (score, weight) => {
        const percentage = (score / weight) * 5;
        return (
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < percentage ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl m-4">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-sky-400 flex items-center gap-3">
                        <Building /> Company Supervisor Evaluation
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <p><strong className="text-slate-400">Student:</strong> {evaluation.studentName}</p>
                        <p><strong className="text-slate-400">Company:</strong> {evaluation.company}</p>
                        <p><strong className="text-slate-400">Supervisor:</strong> {evaluation.supervisor}</p>
                        <p><strong className="text-slate-400">Date:</strong> {evaluation.date}</p>
                    </div>
                    
                    <div className="mb-6">
                        <p className="text-lg font-semibold text-white mb-2">Detailed Scores</p>
                        <div className="space-y-3 bg-slate-900/50 p-4 rounded-lg">
                        {Object.entries(evaluation.performance.scores).map(([key, { score, weight }]) => (
                            <div key={key} className="flex justify-between items-center">
                            <span className="text-slate-300">{key}</span>
                            <div className='flex items-center gap-2'>
                                {renderStars(score, weight)}
                                <span className='text-slate-400 w-12 text-right'>({score}/{weight})</span>
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-lg font-semibold text-white mb-2">Supervisor Comments</p>
                        <p className="bg-slate-900/60 p-4 rounded-lg text-slate-300 italic">"{evaluation.comments}"</p>
                    </div>

                     <div className="text-right font-bold text-sky-400 mt-4 pt-4 border-t border-slate-700 text-2xl">
                        Final Grade from Company: {evaluation.finalGrade.toFixed(2)} / 40%
                    </div>
                </div>
            </div>
        </div>
    );
};


const OrganizationUpdates = () => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const evaluation = selectedStudent ? mockOrgEvaluations[selectedStudent] : null;

  return (
    <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl">
      <h2 className="text-3xl font-extrabold text-white mb-6 border-b border-slate-700 pb-4">Organization Updates</h2>

      <div className="mb-6 max-w-sm">
        <label htmlFor="student-select" className="block text-sm font-medium text-slate-300 mb-2">
          Select a Student
        </label>
        <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select
                id="student-select"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500"
            >
                <option value="">-- View Evaluation For --</option>
                {mockStudents.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
                ))}
            </select>
        </div>
      </div>

      {evaluation ? (
        <div className="bg-slate-800/50 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong className="text-slate-400">Company:</strong> {evaluation.company}</div>
                <div><strong className="text-slate-400">Supervisor:</strong> {evaluation.supervisor}</div>
                <div><strong className="text-slate-400">Evaluation Date:</strong> {evaluation.date}</div>
                <div className="text-lg font-bold"><strong className="text-slate-400">Final Grade:</strong> <span className="text-sky-400">{evaluation.finalGrade.toFixed(2)}%</span></div>
            </div>
            <div className="mt-4">
                <strong className="text-slate-400">Comments:</strong>
                <p className="italic text-slate-300 line-clamp-2">"{evaluation.comments}"</p>
            </div>
            <div className="text-right mt-4">
                <button 
                    onClick={() => setSelectedEvaluation(evaluation)}
                    className="font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-2 ml-auto"
                >
                    <FileText size={16} /> View Full Evaluation
                </button>
            </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
            <p>Please select a student to view their evaluation from the host company.</p>
        </div>
      )}
      <EvaluationModal evaluation={selectedEvaluation} onClose={() => setSelectedEvaluation(null)} />
    </div>
  );
};

export default OrganizationUpdates;