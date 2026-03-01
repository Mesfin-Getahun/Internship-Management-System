import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';
import { FileDown, Printer } from 'lucide-react';

const EvaluationSummary = ({ student, attendanceData, performanceData, onBack }) => {

    const calculateAttendanceMark = (totalAbsent) => {
        if (totalAbsent === 0) return 10;
        if (totalAbsent <= 2) return 8;
        if (totalAbsent <= 4) return 6;
        if (totalAbsent <= 10) return 2;
        return 0; // More than 10 days absent
    };

    const attendanceMark = calculateAttendanceMark(attendanceData.totalAbsent);
    const performanceMark = performanceData.totalMark;
    const totalCompanyResult = (performanceMark / 70) * 30; // As per form, this is 30%
    const finalGrade = attendanceMark + totalCompanyResult;

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text("Company Assessment Form", 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Bahir Dar Institute of Technology, Bahir Dar University`, 105, 28, { align: 'center' });

        // Student Info
        doc.autoTable({
            startY: 40,
            head: [['Student Name', 'Hosting Company', 'Department']],
            body: [[student.name, student.company, student.department]],
            theme: 'grid'
        });

        // Performance Scores
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Assessment Criteria', 'Weight', 'Actual Rate']],
            body: [
                ...Object.entries(performanceData.scores).map(([key, value]) => {
                    const criteria = [...Object.values(evaluationCriteria)].flat().find(c => c.id === key);
                    return [criteria.label, `${criteria.weight}%`, `${value}%`];
                }),
                [{ content: 'Subtotal mark (70%)', colSpan: 2, styles: { fontStyle: 'bold' } }, { content: `${performanceMark}%`, styles: { fontStyle: 'bold' } }]
            ],
            theme: 'grid'
        });
        
        // Attendance
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Attendance Details', 'Value']],
            body: [
                ['Total Absent Days', attendanceData.totalAbsent],
                ['Fill Attendance result (10%)', `${attendanceMark}%`],
            ],
            theme: 'grid'
        });

        // Final Scores
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 10,
            body: [
                [{ content: 'Total Company Assessment result (40%)', styles: { fontStyle: 'bold' } }, { content: `${(totalCompanyResult + attendanceMark).toFixed(2)}%`, styles: { fontStyle: 'bold' } }],
            ],
            theme: 'striped'
        });

        doc.save(`Assessment-${student.name}.pdf`);
        toast.success("PDF successfully generated!");
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4">Step 3: Summary & Export</h3>
            <div className="bg-slate-800/50 p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-slate-300">Total Absent Days:</span>
                    <span className="font-bold text-white">{attendanceData.totalAbsent}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-300">Attendance Mark (10%):</span>
                    <span className="font-bold text-white">{attendanceMark}%</span>
                </div>
                <hr className="border-slate-700" />
                <div className="flex justify-between items-center">
                    <span className="text-slate-300">Performance Subtotal (70%):</span>
                    <span className="font-bold text-white">{performanceMark}%</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-300">Company Assessment Result (30%):</span>
                    <span className="font-bold text-white">{totalCompanyResult.toFixed(2)}%</span>
                </div>
                <hr className="border-slate-700" />
                <div className="flex justify-between items-center text-emerald-400 text-xl">
                    <span className="font-extrabold">Final Grade (40%):</span>
                    <span className="font-extrabold">{finalGrade.toFixed(2)}%</span>
                </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
                <button onClick={onBack} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-lg">
                    Back
                </button>
                <button
                    onClick={generatePDF}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
                >
                    <Printer size={18} />
                    Generate & Send PDF
                </button>
            </div>
        </div>
    );
};

// Re-defining criteria here to be self-contained, ideally this would be imported from a shared file
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


export default EvaluationSummary;