import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload, faCheckCircle, faPrint } from '@fortawesome/free-solid-svg-icons';

const EvaluationSummary = ({ student, attendanceData, performanceData, onBack, onSubmitHook }) => {

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

    const generatePDFAndSubmit = async () => {
        try {
            // First run the API dispatch hook via parent passing
            if (onSubmitHook) await onSubmitHook();

            // Next generate the physical offline file payload
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
                body: [[student.name, student.company || 'N/A', student.department || 'N/A']],
                theme: 'grid'
            });

            // Performance Scores
            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 10,
                head: [['Assessment Criteria Form Total', 'Weight', 'Actual Rate']],
                body: [
                    [{ content: 'Total Criteria Grade Registered', colSpan: 2 }, { content: `${performanceMark}% / 70%` }]
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
            toast.success("Grade submitted AND PDF record downloaded successfully!");
        } catch (e) {
            console.error(e);
            toast.error("Process aborted visually.");
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-black text-emerald-400 tracking-tight mb-6">Execution & Final Report</h3>
            <div className="bg-slate-900/80 p-8 rounded-2xl border border-emerald-900/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] space-y-6">
                
                <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Calculated Absences:</span>
                    <span className="text-xl font-bold text-white bg-slate-900 px-4 py-1.5 rounded-lg border border-slate-700">{attendanceData.totalAbsent} Days</span>
                </div>
                
                <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Attendance Scale Result:</span>
                    <span className="text-xl font-bold text-white bg-slate-900 px-4 py-1.5 rounded-lg border border-slate-700">{attendanceMark} / 10</span>
                </div>
                
                <hr className="border-slate-700/50 my-6" />
                
                <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Performance Form Subtotal:</span>
                    <span className="text-xl font-bold text-emerald-300 bg-emerald-900/30 px-4 py-1.5 rounded-lg border border-emerald-800">{performanceMark} / 70</span>
                </div>
                
                <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Corporate Rubric Converted:</span>
                    <span className="text-xl font-bold text-emerald-300 bg-emerald-900/30 px-4 py-1.5 rounded-lg border border-emerald-800">{totalCompanyResult.toFixed(2)} / 30</span>
                </div>
                
                <hr className="border-emerald-900/50 my-8 shadow-inner" />
                
                <div className="flex justify-between items-center text-emerald-400 text-3xl bg-emerald-900/40 p-6 rounded-2xl border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/10">
                    <span className="font-black uppercase tracking-tighter">Final Output Matrix</span>
                    <span className="font-extrabold font-mono bg-emerald-600 text-white px-6 py-2 rounded-xl border border-emerald-400">{finalGrade.toFixed(2)}<span className="text-sm opacity-60 ml-2">/ 40.00</span></span>
                </div>

            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
                <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold uppercase tracking-widest text-[11px] py-4 px-8 rounded-xl transition-all shadow-sm">
                    Revisit Metrics
                </button>
                <div className="text-right">
                    <button
                        onClick={generatePDFAndSubmit}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[11px] py-4 px-8 rounded-xl flex items-center gap-3 transition-all shadow-xl shadow-emerald-500/30 active:scale-95 border border-emerald-500"
                    >
                        <FontAwesomeIcon icon={faCheckCircle} size="lg" />
                        Transmit & Render PDF Extract
                    </button>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-2 pr-1">Warning: Finalizes university register log.</p>
                </div>
            </div>
        </div>
    );
};

export default EvaluationSummary;