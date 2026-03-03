import React, { useState } from 'react';

const AttendanceForm = ({ onNext, initialData }) => {
    const [absentDays, setAbsentDays] = useState(initialData.absentDays || { week1: 0, week2: 0, week3: 0, week4: 0 });

    const handleNext = () => {
        const totalAbsent = Object.values(absentDays).reduce((sum, days) => sum + Number(days), 0);
        onNext({ absentDays, totalAbsent });
    };

    const handleDaysChange = (week, value) => {
        const numValue = Math.max(0, Number(value));
        setAbsentDays(prev => ({ ...prev, [week]: numValue }));
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4">Step 1: Monthly Attendance Sheet</h3>
            <div className="space-y-4">
                {['week1', 'week2', 'week3', 'week4'].map((week, index) => (
                    <div key={week} className="flex items-center justify-between">
                        <label htmlFor={week} className="text-slate-300 font-medium">Days Absent in Week {index + 1}</label>
                        <input
                            type="number"
                            id={week}
                            value={absentDays[week]}
                            onChange={(e) => handleDaysChange(week, e.target.value)}
                            className="w-24 bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                ))}
            </div>
            <div className="mt-8 flex justify-end">
                <button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg">
                    Next
                </button>
            </div>
        </div>
    );
};

export default AttendanceForm;