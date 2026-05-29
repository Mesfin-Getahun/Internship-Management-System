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
import { faArrowLeft, faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';

const evaluationSections = {
    general: ['grooming', 'workAttitude', 'consistency', 'selfConfidence', 'communicationSkills'],
    personal: ['qualityWorkAccuracy', 'engagement', 'creativityInnovation', 'independentPotential', 'teamwork'],
    professional: ['technicalSkills', 'organizationSkills', 'coordinationSkills', 'responsibilitySkills', 'problemSolvingSkills'],
};

const activeStatuses = new Set(['accepted', 'in progress', 'active']);

const isCurrentPlacement = (student) => {
    const status = (student.status || '').toLowerCase();
    const completed =
        student.roster_status === 'completed' ||
        Number(student.is_completed) === 1 ||
        Boolean(student.evaluation_id) ||
        status === 'completed' ||
        status === 'complete';

    return activeStatuses.has(status) && !completed;
};

const parseEvaluationTarget = (value) => {
    let rawValue = String(value || '');

    try {
        rawValue = decodeURIComponent(rawValue);
    } catch {
        // Keep the raw route value if decoding fails.
    }

    const separatorIndex = rawValue.indexOf('_');

    if (separatorIndex === -1) {
        return {
            internshipId: 'default',
            studentId: rawValue,
        };
    }

    return {
        internshipId: rawValue.slice(0, separatorIndex),
        studentId: rawValue.slice(separatorIndex + 1),
    };
};

const getPlacementEndDate = (student) =>
    student?.placement_end_date || student?.internship_end_date || student?.end_date || null;

const hasInternshipEnded = (student) => {
    const endDate = getPlacementEndDate(student);
    if (!endDate) return false;

    const end = new Date(endDate);
    if (Number.isNaN(end.getTime())) return false;

    end.setHours(23, 59, 59, 999);
    return end <= new Date();
};

const formatDate = (dateValue) => {
    if (!dateValue) return 'not set';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'not set';
    return date.toLocaleDateString();
};

const TWO_MONTH_DEPARTMENTS = new Set([
    'computer science',
    'information technology',
    'information system',
    'information systems',
    'cyber security',
    'cybersecurity',
    'it education',
    'information technology education',
]);

const normalizeDepartment = (department = '') =>
    String(department)
        .trim()
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const getRequiredInternshipMonths = (department) => {
    const departments = String(department || '')
        .split(/[,;|/]+/)
        .map(normalizeDepartment)
        .filter(Boolean);

    if (departments.length === 0) return 4;

    return departments.every((item) => TWO_MONTH_DEPARTMENTS.has(item)) ? 2 : 4;
};

const SupervisorStudentEvaluation = () => {
    const { studentId, '*': wildcardId } = useParams(); // Format should be internshipId_studentId
    const paramId = studentId || wildcardId || '';
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Parse only the first separator because student IDs may also contain underscores.
    const { internshipId, studentId: trueStudentId } = parseEvaluationTarget(paramId);

    const [step, setStep] = useState(1);
    const [attendanceData, setAttendanceData] = useState({});
    const [performanceData, setPerformanceData] = useState({});
    const [studentProfile, setStudentProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const internshipMonthCount = getRequiredInternshipMonths(studentProfile?.department);

    const buildAttendanceRecords = () => {
       const absentDays = attendanceData.absentDays || {};
       const records = {};

       Array.from({ length: internshipMonthCount }, (_, monthIndex) => {
          const monthKey = `Month_${monthIndex + 1}`;
          const monthAbsentDays = absentDays[monthKey] || {};

          records[monthKey] = Object.fromEntries(
             ['week1', 'week2', 'week3', 'week4'].map((weekKey, weekIndex) => {
                const absent = Math.max(0, Math.min(5, Number(monthAbsentDays[weekKey] || 0)));
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

                return [
                   `Week_${weekIndex + 1}`,
                   Object.fromEntries(
                      days.map((day, dayIndex) => [day, dayIndex < absent ? 'A' : 'P'])
                   ),
                ];
             })
          );
       });

       return records;
    };

    const buildAssessmentPayload = () => ({
       general: Object.fromEntries(
          evaluationSections.general.map((key) => [key, Number(performanceData.scores?.[key] || 0)])
       ),
       personal: Object.fromEntries(
          evaluationSections.personal.map((key) => [key, Number(performanceData.scores?.[key] || 0)])
       ),
       professional: Object.fromEntries(
          evaluationSections.professional.map((key) => [key, Number(performanceData.scores?.[key] || 0)])
       ),
       comments: performanceData.comments || '',
    });

    // Fetch basic matched student profile from the backend assignment list
    useEffect(() => {
       const fetchRoster = async () => {
          try {
             const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company_mentor/students`, {
                headers: { Authorization: `Bearer ${user?.token}` }
             });
             const students = res.data.students || res.data || [];
             const match = students.find(s =>
                (s.student_id || s.id || '').toString() === trueStudentId.toString() &&
                (s.internship_id || '').toString() === internshipId.toString()
             );
             setStudentProfile(match || {
                id: trueStudentId,
                student_id: trueStudentId,
                name: 'Assigned Intern',
                universityId: trueStudentId?.substring(0,8) || 'N/A',
                department: 'Target Department',
                company: 'Your Company',
                internship_id: internshipId,
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
    }, [internshipId, trueStudentId, user?.token]);

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
           const payload = {
              assessment: buildAssessmentPayload(),
              attendanceData: {
                 ...attendanceData,
                 records: buildAttendanceRecords(),
              },
           };

           await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/api/company_mentor/evaluation/${internshipId}/${trueStudentId}`,
              payload,
              { headers: { Authorization: `Bearer ${user?.token}` } }
           );

           toast.success("Evaluation and attendance were submitted successfully.");
       } catch (err) {
           console.error("Submission trigger failed.", err);
           toast.error(err.response?.data?.message || "Failed to transmit the final grade to the university registry.");
           throw err;
       }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <AttendanceForm onNext={handleNext} initialData={attendanceData} monthCount={internshipMonthCount} />;
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

    const canEvaluate = isCurrentPlacement(studentProfile) && hasInternshipEnded(studentProfile);
    const endDateLabel = formatDate(getPlacementEndDate(studentProfile));

    if (!canEvaluate) {
        return (
            <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl max-w-5xl mx-auto border border-slate-800 animate-fade-in">
                <ToastContainer theme="dark" position="bottom-right" />
                <div className="flex flex-col gap-6">
                    <button
                        type="button"
                        onClick={() => navigate('/org-supervisor/evaluation')}
                        className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-300 transition-all hover:bg-slate-700"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Back
                    </button>

                    <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-8">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
                            <FontAwesomeIcon icon={faLock} size="lg" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">Assessment Not Available Yet</h2>
                        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
                            The page is available, but the attendance and final evaluation form stays locked until this student's internship duration is finished.
                        </p>

                        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Student</p>
                                <p className="mt-2 text-lg font-bold text-white">{studentProfile.student_name || studentProfile.name || 'Assigned Intern'}</p>
                                <p className="mt-1 text-sm text-slate-400">{studentProfile.student_id || studentProfile.id || trueStudentId}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Internship End Date</p>
                                <p className="mt-2 text-lg font-bold text-amber-200">{endDateLabel}</p>
                                <p className="mt-1 text-sm text-slate-400">{studentProfile.internship_title || 'Internship placement'}</p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/40 p-5">
                            <p className="text-sm font-semibold text-slate-300">
                                Attendance entry, performance scoring, final submission, and PDF generation are disabled for now.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
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
