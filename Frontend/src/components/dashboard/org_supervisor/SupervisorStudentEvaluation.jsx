import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AttendanceForm from './AttendanceForm';
import PerformanceForm from './PerformanceForm';
import EvaluationSummary from './EvaluationSummary';
import { useAuth } from '../../../AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const SupervisorStudentEvaluation = () => {
    const { studentId: paramId } = useParams(); // Format should be internshipId_studentId
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Parse the composite ID parameter injected by MyStudents link
    const parts = paramId ? paramId.split('_') : [];
    const internshipId = parts.length > 1 ? parts[0] : 'default';
    const trueStudentId = parts.length > 1 ? parts[1] : paramId;

    const [step, setStep] = useState(1);
    const [attendanceData, setAttendanceData] = useState({});
    const [performanceData, setPerformanceData] = useState({});
    const [studentProfile, setStudentProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch basic matched student profile from the backend assignment list
    useEffect(() => {
       const fetchRoster = async () => {
          try {
             const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company_mentor/students`, {
                headers: { Authorization: `Bearer ${user?.token}` }
             });
             const students = res.data.students || res.data || [];
             const match = students.find(s => 
                (s.student_id || s.id || '').toString() === trueStudentId.toString()
             );
             setStudentProfile(match || { 
                id: trueStudentId, 
                name: match?.student_name || 'Assigned Intern', 
                universityId: trueStudentId.substring(0,8), 
                department: match?.department || 'Target Department',
                company: match?.company_name || 'Your Company'
             });
          } catch (err) {
             console.error("Failed fetching profile to evaluate.", err);
             // Provide fallback block so the review form can still be filled out and submitted
             setStudentProfile({ 
                id: trueStudentId, 
                name: 'Assigned Intern (Offline Cache)', 
                universityId: trueStudentId.substring(0,8), 
                company: 'Evaluation Context'
             });
          } finally {
             setLoading(false);
          }
       };
       if (user?.token) fetchRoster();
    }, [user, trueStudentId]);

    const handleNext = (data) => {
        if (step === 1) {
            setAttendanceData(data);
            toast.success("Attendance cached. Proceed to performance factors.");
        } else if (step === 2) {
            setPerformanceData(data);
            toast.success("Performance matrix calculated.");
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmitEvaluationToAPI = async () => {
       try {
           // Calculate the final marks matching EvaluationSummary
           const getAttMark = (absent) => {
               if (absent === 0) return 10;
               if (absent <= 2) return 8;
               if (absent <= 4) return 6;
               if (absent <= 10) return 2;
               return 0;
           };
           const attendanceMark = getAttMark(attendanceData.totalAbsent || 0);
           const totalCompanyResult = ((performanceData.totalMark || 0) / 70) * 30;
           const finalGradeRaw = attendanceMark + totalCompanyResult;

           const payload = {
              rating: (finalGradeRaw / 40) * 5, // Convert 40-point scale back to 5-star standard rating format
              feedback_text: `[SYS_V2] Final Corporate Appraisal Score: ${finalGradeRaw.toFixed(2)} / 40.00. (Attendance: ${attendanceMark}/10, Rubric: ${(performanceData.totalMark || 0)}/70 -> Scaled: ${totalCompanyResult.toFixed(2)}/30). Assessed via Form.`
           };
           
           // Dispatch to active integration endpoint
           await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/api/company_mentor/feedBack/${internshipId}/${trueStudentId}`, 
              payload,
              { headers: { Authorization: `Bearer ${user?.token}` } }
           );
           
           // Generation logic handles the success PDF inside the EvaluationSummary component manually via jsPDF.
           // Toast happens there.
       } catch (err) {
           console.error("Submission trigger failed.", err);
           toast.error("Failed to transmit the final grade to the university registry.");
       }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <AttendanceForm onNext={handleNext} initialData={attendanceData} />;
            case 2:
                return <PerformanceForm onNext={handleNext} onBack={handleBack} initialData={performanceData} />;
            case 3:
                return <EvaluationSummary 
                           student={studentProfile} 
                           attendanceData={attendanceData} 
                           performanceData={performanceData} 
                           onBack={handleBack} 
                           onSubmitHook={handleSubmitEvaluationToAPI} // Exposing hook since PDF Generation happens there.
                       />;
            default:
                return <div className="text-emerald-500 font-bold">Step undefined.</div>;
        }
    };

    if (loading) {
       return (
          <div className="flex flex-col items-center justify-center p-20 bg-slate-900 rounded-2xl shadow-2xl">
              <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-emerald-500 mb-4" />
              <p className="font-bold text-white text-lg">Initializing Context...</p>
          </div>
       );
    }

    if (!studentProfile) {
        return <div className="text-center text-red-500 bg-slate-900 p-8 rounded-2xl font-bold">Invalid target identity requested.</div>;
    }

    return (
        <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-5xl mx-auto border border-slate-800 animate-fade-in">
            <ToastContainer theme="dark" position="bottom-right" />
            <div className="flex justify-between items-center mb-6">
               <div>
                  <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">Internship Assessment</h2>
                  <p className="text-lg text-emerald-400 font-black uppercase tracking-widest bg-emerald-900/20 px-4 py-2 rounded-xl inline-block border border-emerald-900/50">
                      Target: {studentProfile.student_name || studentProfile.name}
                  </p>
               </div>
            </div>
            
            {/* Embedded Progress Graph */}
            <div className="w-full mb-10 pb-6 border-b border-slate-800">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3 px-1">
                    <span className={step >= 1 ? 'text-emerald-400 transition-colors' : ''}>1. Attendance Tracker</span>
                    <span className={step >= 2 ? 'text-emerald-400 transition-colors' : ''}>2. Performance Matrix</span>
                    <span className={step >= 3 ? 'text-emerald-400 transition-colors' : ''}>3. Official Export & Submit</span>
                </div>
                <div className="bg-slate-800 rounded-full h-3 border border-slate-700 overflow-hidden shadow-inner flex relative">
                    <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="bg-slate-800/20 p-6 rounded-2xl border border-slate-800/50">
               {renderStep()}
            </div>
        </div>
    );
};

export default SupervisorStudentEvaluation;
