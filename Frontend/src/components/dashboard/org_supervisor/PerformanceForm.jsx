import React, { useState, useMemo } from 'react';

const evaluationCriteria = {
    general: [
        { id: 'grooming', label: 'Grooming', weight: 2 },
        { id: 'workAttitude', label: 'Work Attitude', weight: 2 },
        { id: 'consistency', label: 'Consistency', weight: 2 },
        { id: 'selfConfidence', label: 'Self Confidence', weight: 2 },
        { id: 'communicationSkills', label: 'Communication Skills', weight: 2 },
    ],
    personal: [
        { id: 'qualityWorkAccuracy', label: 'Quality Work/Accuracy', weight: 2 },
        { id: 'engagement', label: 'Engagement', weight: 2 },
        { id: 'creativityInnovation', label: 'Creativity/Innovation', weight: 2 },
        { id: 'independentPotential', label: 'Independent Potential', weight: 2 },
        { id: 'teamwork', label: 'Teamwork', weight: 2 },
    ],
    professional: [
        { id: 'technicalSkills', label: 'Technical skills', weight: 4 },
        { id: 'organizationSkills', label: 'Organization skills', weight: 4 },
        { id: 'coordinationSkills', label: 'Coordination skills', weight: 4 },
        { id: 'responsibilitySkills', label: 'Responsibility Skills', weight: 4 },
        { id: 'problemSolvingSkills', label: 'Problem solving Skills', weight: 4 },
    ],
};

const PerformanceForm = ({ onNext, onBack, initialData }) => {
    const [scores, setScores] = useState(initialData.scores || {});

    const handleScoreChange = (category, id, value) => {
        const numValue = Math.max(0, Math.min(evaluationCriteria[category].find(c => c.id === id).weight, Number(value)));
        setScores(prev => ({
            ...prev,
            [id]: numValue,
        }));
    };

    const calculateSubtotal = (category) => {
        return evaluationCriteria[category].reduce((total, item) => total + (scores[item.id] || 0), 0);
    };

    const totalMark = useMemo(() => {
        return calculateSubtotal('general') + calculateSubtotal('personal') + calculateSubtotal('professional');
    }, [scores]);

    const handleNext = () => {
        onNext({ scores, totalMark });
    };

    const renderCategory = (category) => (
        <div key={category} className="bg-slate-800/50 p-6 rounded-xl mb-6">
            <h4 className="text-lg font-semibold text-emerald-300 mb-4 capitalize">{category} Assessment Skills</h4>
            <div className="space-y-4">
                {evaluationCriteria[category].map(item => (
                    <div key={item.id} className="grid grid-cols-3 items-center gap-4">
                        <label htmlFor={item.id} className="text-slate-300 col-span-1">{item.label}</label>
                        <input
                            type="number"
                            id={item.id}
                            value={scores[item.id] || ''}
                            onChange={(e) => handleScoreChange(category, item.id, e.target.value)}
                            className="w-24 bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-emerald-500"
                            max={item.weight}
                            min="0"
                        />
                        <span className="text-slate-400">/ {item.weight}%</span>
                    </div>
                ))}
            </div>
            <div className="text-right font-bold text-emerald-400 mt-4 pt-4 border-t border-slate-700">
                Subtotal: {calculateSubtotal(category)} / {evaluationCriteria[category].reduce((acc, i) => acc + i.weight, 0)}%
            </div>
        </div>
    );

    return (
        <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4">Step 2: Company Assessment Form</h3>
            {renderCategory('general')}
            {renderCategory('personal')}
            {renderCategory('professional')}
            
            <div className="mt-8 p-4 bg-slate-900/70 rounded-lg text-right">
                <span className="text-xl font-bold text-white">Total Company Assessment Result: {totalMark} / 70%</span>
            </div>

            <div className="mt-8 flex justify-between">
                <button onClick={onBack} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-lg">
                    Back
                </button>
                <button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg">
                    Next
                </button>
            </div>
        </div>
    );
};

export default PerformanceForm;