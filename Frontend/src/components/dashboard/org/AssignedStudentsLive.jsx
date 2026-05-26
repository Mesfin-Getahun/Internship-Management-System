import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCheck, faSpinner, faUsersSlash } from '@fortawesome/free-solid-svg-icons';

const AssignedStudentsLive = () => {
  const [students, setStudents] = useState([]);
  const [companyMentors, setCompanyMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentors, setSelectedMentors] = useState({});
  const [assigningStudentId, setAssigningStudentId] = useState(null);
  const { user } = useAuth();

  const authConfig = user?.token
    ? { headers: { Authorization: `Bearer ${user.token}` } }
    : null;

  const fetchAssignedStudents = async () => {
    if (!authConfig) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [applicationsRes, mentorsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company/getApplications`, authConfig),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/company/mentors`, authConfig),
      ]);

      const applications = Array.isArray(applicationsRes.data?.applications)
        ? applicationsRes.data.applications
        : [];
      const mentors = Array.isArray(mentorsRes.data?.mentors)
        ? mentorsRes.data.mentors
        : [];
      const activeMentors = mentors.filter(
        (mentor) => String(mentor.account_status || 'active').toLowerCase() === 'active',
      );

      const activePlacements = applications.filter((application) => {
        const placementStatus = String(application.placement_status || '').toLowerCase();
        const applicationStatus = String(application.status || '').toLowerCase();
        return (
          ['accepted', 'in progress', 'active'].includes(placementStatus) ||
          (!placementStatus && ['accepted', 'approved', 'active'].includes(applicationStatus))
        );
      });

      setStudents(activePlacements);
      setCompanyMentors(activeMentors);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load assigned students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchAssignedStudents();
    }
  }, [user?.token]);

  const handleMentorSelect = (studentId, mentorId) => {
    setSelectedMentors((prev) => ({
      ...prev,
      [studentId]: mentorId,
    }));
  };

  const handleAssign = async (student) => {
    const studentId = student.student_id || student.id;
    const mentorIdToAssign = selectedMentors[studentId];

    if (!mentorIdToAssign || !authConfig) {
      toast.warn('Please select a mentor first.');
      return;
    }

    try {
      setAssigningStudentId(studentId);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/company/assignMentor`,
        {
          student_internship_id: student.student_internship_id,
          student_id: studentId,
          company_mentor_id: mentorIdToAssign,
        },
        authConfig,
      );

      const mentorObj = companyMentors.find(
        (mentor) => String(mentor.company_mentor_id) === String(mentorIdToAssign),
      );
      toast.success(
        `${mentorObj?.full_name || 'Mentor'} has been ${student.company_mentor_id ? 'assigned as the new mentor' : 'assigned to the student'}.`,
      );
      await fetchAssignedStudents();
      setSelectedMentors((prev) => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to assign mentor. Please try again.');
    } finally {
      setAssigningStudentId(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Assign Mentors to Students</h2>
        <p className="text-slate-500 text-sm mt-1">Assign or change company mentors while keeping each mentor&apos;s previous feedback history.</p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-blue-500">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-slate-400">
            <FontAwesomeIcon icon={faUsersSlash} size="3x" className="mb-4 opacity-50 text-slate-300" />
            <p className="font-bold text-lg text-slate-700 dark:text-white">No active students in your organization.</p>
            <p className="text-sm mt-1">Approve applications in the applications page to place them here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">Student Name</th>
                  <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">Faculty</th>
                  <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">Assigned Mentor</th>
                  <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-center border-b border-slate-100 dark:border-slate-800">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((student) => {
                  const studentId = student.student_id || student.id;
                  const currentMentorId = student.company_mentor_id ? String(student.company_mentor_id) : '';
                  const selectedMentorId = selectedMentors[studentId] || '';
                  const isAssigned = Boolean(currentMentorId);
                  const isSameMentor = selectedMentorId && String(selectedMentorId) === currentMentorId;
                  return (
                    <tr key={studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-6 border-r border-slate-50 dark:border-slate-800/50 max-w-[220px]">
                        <p className="font-bold text-slate-800 dark:text-white truncate">{student.student_name || 'Anonymous Student'}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 truncate">{student.internship_title || 'Internship'}</p>
                      </td>
                      <td className="p-6 text-sm text-slate-600 dark:text-slate-400 font-semibold border-r border-slate-50 dark:border-slate-800/50">
                        {student.faculty || student.department || 'Not Specified'}
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-3">
                          {isAssigned && (
                          <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/10 px-4 py-2.5 rounded-xl border border-green-100/50 dark:border-green-900/30 inline-flex">
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                              <FontAwesomeIcon icon={faUserCheck} size="sm" />
                            </div>
                            <span className="font-bold text-sm text-green-700 dark:text-green-400">
                              {student.company_mentor_name || 'Assigned'}
                            </span>
                          </div>
                          )}
                          <select
                            onChange={(event) => handleMentorSelect(studentId, event.target.value)}
                            className="w-full max-w-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm appearance-none cursor-pointer"
                            value={selectedMentors[studentId] || ''}
                          >
                            <option value="">{isAssigned ? 'Choose a new mentor...' : 'Choose organizational mentor...'}</option>
                            {companyMentors.map((mentor) => (
                              <option
                                key={mentor.company_mentor_id}
                                value={mentor.company_mentor_id}
                                disabled={Number(mentor.assigned_students || 0) >= 10 && String(mentor.company_mentor_id) !== currentMentorId}
                              >
                                {mentor.full_name} ({Number(mentor.assigned_students || 0)} / 10)
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <button
                          onClick={() => handleAssign(student)}
                          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 active:scale-95 uppercase tracking-wider"
                          disabled={!selectedMentorId || isSameMentor || assigningStudentId === studentId}
                        >
                          {assigningStudentId === studentId ? 'Saving...' : isAssigned ? 'Change' : 'Finalize'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedStudentsLive;
