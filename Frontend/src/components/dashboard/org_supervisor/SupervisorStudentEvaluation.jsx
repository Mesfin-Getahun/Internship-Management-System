import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import AttendanceForm from './AttendanceForm';
import PerformanceForm from './PerformanceForm';
import EvaluationSummary from './EvaluationSummary';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Mock data for student - in a real app, you'd fetch this
const mockStudents = [
    { id: '1', name: 'John Doe', universityId: 'BDU12345', department: 'Software Engineering', company: 'Google' },
    { id: '2', name: 'Jane Smith', universityId: 'BDU67890', department: 'Computer Science', company: 'Google' },
];

const SupervisorStudentEvaluation = () => {
    const { studentId } = useParams();
    const student = mockStudents.find(s => s.id === studentId);

    const [step, setStep] = useState(1);
    const [attendanceData, setAttendanceData] = useState({});
    const [performanceData, setPerformanceData] = useState({});

    const handleNext = (data) => {
        if (step === 1) {
            setAttendanceData(data);
            toast.success("Attendance saved!");
        } else if (step === 2) {
            setPerformanceData(data);
            toast.success("Performance evaluation saved!");
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <AttendanceForm onNext={handleNext} initialData={attendanceData} />;
            case 2:
                return <PerformanceForm onNext={handleNext} onBack={handleBack} initialData={performanceData} />;
            case 3:
                return <EvaluationSummary student={student} attendanceData={attendanceData} performanceData={performanceData} onBack={handleBack} />;
            default:
                return <div>Unknown Step</div>;
        }
    };

    if (!student) {
        return <div className="text-center text-red-500">Student not found.</div>;
    }

    return (
        <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto">
            <ToastContainer theme="dark" position="bottom-right" />
            <h2 className="text-3xl font-extrabold text-white mb-2">Internship Assessment</h2>
            <p className="text-lg text-emerald-400 font-semibold mb-6 border-b border-slate-700 pb-4">
                For: {student.name} ({student.universityId})
            </p>
            
            {/* Progress Bar */}
            <div className="w-full mb-8">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span className={step >= 1 ? 'text-emerald-400 font-semibold' : ''}>1. Attendance</span>
                    <span className={step >= 2 ? 'text-emerald-400 font-semibold' : ''}>2. Performance</span>
                    <span className={step >= 3 ? 'text-emerald-400 font-semibold' : ''}>3. Summary & Export</span>
                </div>
                <div className="bg-slate-700 rounded-full h-2.5">
                    <div 
                        className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                    ></div>
                </div>
            </div>

            {renderStep()}
        </div>
    );
};

export default SupervisorStudentEvaluation;
