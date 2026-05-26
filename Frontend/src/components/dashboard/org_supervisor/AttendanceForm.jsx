import React, { useEffect, useState } from 'react';

const createEmptyAbsentDays = (monthCount) =>
    Object.fromEntries(
        Array.from({ length: monthCount }, (_, monthIndex) => [
            `Month_${monthIndex + 1}`,
            { week1: 0, week2: 0, week3: 0, week4: 0 },
        ])
    );

const normalizeAbsentDays = (initialData, monthCount) => {
    const fallback = createEmptyAbsentDays(monthCount);
    const initialAbsentDays = initialData.absentDays || {};

    if (initialAbsentDays.Month_1) {
        return Object.fromEntries(
            Object.entries(fallback).map(([monthKey, weeks]) => [
                monthKey,
                { ...weeks, ...(initialAbsentDays[monthKey] || {}) },
            ])
        );
    }

    return {
        ...fallback,
        Month_1: { ...fallback.Month_1, ...initialAbsentDays },
    };
};

const AttendanceForm = ({ onNext, initialData, monthCount = 1 }) => {
    const safeMonthCount = Math.max(1, Number(monthCount || 1));
    const [absentDays, setAbsentDays] = useState(() =>
        normalizeAbsentDays(initialData, safeMonthCount)
    );

    useEffect(() => {
        setAbsentDays((current) =>
            normalizeAbsentDays({ absentDays: current }, safeMonthCount)
        );
    }, [safeMonthCount]);

    const handleNext = () => {
        const totalAbsent = Object.values(absentDays).reduce(
            (monthSum, weeks) =>
                monthSum + Object.values(weeks || {}).reduce((sum, days) => sum + Number(days), 0),
            0
        );
        onNext({ absentDays, totalAbsent, monthCount: safeMonthCount });
    };

    const handleDaysChange = (month, week, value) => {
        const numValue = Math.max(0, Math.min(5, Number(value)));
        setAbsentDays(prev => ({
            ...prev,
            [month]: {
                ...(prev[month] || {}),
                [week]: numValue,
            },
        }));
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4">Step 1: Monthly Attendance Sheet</h3>
            <div className="space-y-6">
                {Array.from({ length: safeMonthCount }, (_, monthIndex) => {
                    const monthKey = `Month_${monthIndex + 1}`;
                    return (
                    <div key={monthKey} className="rounded-xl border border-slate-700 bg-slate-800/40 p-5">
                        <h4 className="mb-4 font-bold text-slate-100">Month {monthIndex + 1}</h4>
                        <div className="space-y-4">
                            {['week1', 'week2', 'week3', 'week4'].map((week, index) => (
                                <div key={`${monthKey}-${week}`} className="flex items-center justify-between gap-4">
                                    <label htmlFor={`${monthKey}-${week}`} className="text-slate-300 font-medium">Days Absent in Week {index + 1}</label>
                                    <input
                                        type="number"
                                        id={`${monthKey}-${week}`}
                                        value={absentDays[monthKey]?.[week] ?? 0}
                                        onChange={(e) => handleDaysChange(monthKey, week, e.target.value)}
                                        min="0"
                                        max="5"
                                        className="w-24 bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    );
                })}
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
