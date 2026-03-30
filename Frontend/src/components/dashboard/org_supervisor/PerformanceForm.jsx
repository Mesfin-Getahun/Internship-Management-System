import React, { useState, useMemo } from 'react';

const evaluationCriteria = {
    general: {
        title: 'General Assessment Criteria',
        weight: 10,
        items: [
            { id: 'grooming', label: 'Grooming', weight: 2 },
            { id: 'workAttitude', label: 'Work Attitude', weight: 2 },
            { id: 'consistency', label: 'Consistency', weight: 2 },
            { id: 'selfConfidence', label: 'Self Confidence', weight: 2 },
            { id: 'communicationSkills', label: 'Communication Skills', weight: 2 },
        ]
    },
    personal: {
        title: 'Personal Assessment Skills by the Supervisor / Coach',
        weight: 10,
        items: [
            { id: 'qualityWorkAccuracy', label: 'Quality Work/Accuracy', weight: 2 },
            { id: 'engagement', label: 'Engagement', weight: 2 },
            { id: 'creativityInnovation', label: 'Creativity/Innovation', weight: 2 },
            { id: 'independentPotential', label: 'Independent Potential', weight: 2 },
            { id: 'teamwork', label: 'Teamwork', weight: 2 },
        ]
    },
    professional: {
        title: 'Professional Assessment Skills by the assessor',
        weight: 20,
        items: [
            { id: 'technicalSkills', label: 'Technical skills', weight: 4 },
            { id: 'organizationSkills', label: 'Organization skills', weight: 4 },
            { id: 'coordinationSkills', label: 'Coordination skills', weight: 4 },
            { id: 'responsibilitySkills', label: 'Responsibility Skills', weight: 4 },
            { id: 'problemSolvingSkills', label: 'Problem solving Skills', weight: 4 },
        ]
    },
};

const PerformanceForm = ({ onNext, onBack, initialData }) => {
    const [scores, setScores] = useState(initialData.scores || {});
    const [comments, setComments] = useState(initialData.comments || '');

    const handleScoreChange = (category, id, value) => {
        const numValue = Math.max(0, Math.min(evaluationCriteria[category].items.find(c => c.id === id).weight, Number(value)));
        setScores(prev => ({
            ...prev,
            [id]: numValue,
        }));
    };

    const calculateSubtotal = (category) => {
        return evaluationCriteria[category].items.reduce((total, item) => total + (scores[item.id] || 0), 0);
    };

    const totalMark = useMemo(() => {
        return calculateSubtotal('general') + calculateSubtotal('personal') + calculateSubtotal('professional');
    }, [scores]);

    const handleNext = () => {
        onNext({ scores, totalMark, comments });
    };

    const renderCategory = (category, data) => (
        <div key={category} className="bg-slate-800/50 p-6 rounded-xl mb-6 border border-slate-700">
            <h4 className="text-lg font-semibold text-emerald-300 mb-1">{data.title}</h4>
            <p className="text-sm text-slate-400 mb-4">Subtotal mark ({data.weight}%)</p>
            
            <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 rounded-l-lg">S.No</th>
                        <th scope="col" className="px-6 py-3">Assessment Criteria</th>
                        <th scope="col" className="px-6 py-3 text-center">Weight</th>
                        <th scope="col" className="px-6 py-3 text-center rounded-r-lg">Actual Rate</th>
                    </tr>
                </thead>
                <tbody>
                    {data.items.map((item, index) => (
                        <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-800/30">
                            <td className="px-6 py-4 font-medium">{index + 1}.{category === 'general' ? index + 1 : ''}</td>
                            <td className="px-6 py-4">{item.label}</td>
                            <td className="px-6 py-4 text-center">{item.weight}%</td>
                            <td className="px-6 py-4 text-center">
                                <input
                                    type="number"
                                    id={item.id}
                                    value={scores[item.id] || ''}
                                    onChange={(e) => handleScoreChange(category, item.id, e.target.value)}
                                    className="w-20 bg-slate-700 border border-slate-600 rounded-md py-1 px-2 text-white focus:ring-1 focus:ring-emerald-500 text-center"
                                    max={item.weight}
                                    min="0"
                                    placeholder="0"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="font-semibold text-white">
                        <td colSpan="3" className="px-6 py-3 text-right">Subtotal mark ({data.weight}%)</td>
                        <td className="px-6 py-3 text-center text-lg text-emerald-400">{calculateSubtotal(category)}%</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );

    return (
        <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4">Step 2: Company Assessment Form</h3>
            
            {renderCategory('general', evaluationCriteria.general)}
            {renderCategory('personal', evaluationCriteria.personal)}
            {renderCategory('professional', evaluationCriteria.professional)}

            <div className="bg-slate-800/50 p-6 rounded-xl mb-6 border border-slate-700">
                <h4 className="text-lg font-semibold text-emerald-300 mb-4">Additional Comments</h4>
                <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-emerald-500"
                    rows="4"
                    placeholder="Provide any additional feedback or comments here..."
                ></textarea>
            </div>
            
            <div className="mt-8 p-4 bg-slate-900/70 rounded-lg flex justify-between items-center border border-slate-700">
                <span className="text-sm text-slate-400">Total Company Assessment Result (40%)</span>
                <span className="text-2xl font-bold text-emerald-400">{totalMark} / 40%</span>
            </div>

            <div className="mt-8 flex justify-between">
                <button onClick={onBack} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    Back
                </button>
                <button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    Save & Continue
                </button>
            </div>
        </div>
    );
};

export default PerformanceForm;