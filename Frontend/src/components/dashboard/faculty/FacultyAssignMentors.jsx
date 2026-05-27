import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getDepartmentOptions, matchesDepartment } from '../../../utils/departmentFilters';

const FacultyAssignMentors = () => {
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [departments, setDepartments] = useState(['All Departments']);
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [loading, setLoading] = useState(true);
  const [assigningMentorId, setAssigningMentorId] = useState(null);
  const [mentorForm, setMentorForm] = useState({
    mentor_id: '',
    full_name: '',
    email: '',
    phone_number: '',
    reset_password: false,
  });
  const [editingMentorId, setEditingMentorId] = useState(null);
  const [savingMentor, setSavingMentor] = useState(false);
  const { user } = useAuth();

  const authConfig = user?.token
    ? { headers: { Authorization: `Bearer ${user.token}` } }
    : null;

  const fetchAssignmentData = async () => {
    if (!authConfig) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [studentsRes, mentorsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/students`, authConfig),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/mentors`, authConfig),
      ]);

      const studentsData = Array.isArray(studentsRes.data?.students) ? studentsRes.data.students : [];
      const mentorsData = Array.isArray(mentorsRes.data?.mentors) ? mentorsRes.data.mentors : [];

      setDepartments(getDepartmentOptions(studentsData));
      setUnassignedStudents(
        studentsData.filter(
          (student) => !student.university_mentor_id && !student.university_mentor_name,
        ),
      );
      setMentors(mentorsData);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load faculty assignment data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchAssignmentData();
    }
  }, [user?.token]);

  const filteredUnassignedStudents = unassignedStudents.filter((student) =>
    matchesDepartment(student, selectedDepartment),
  );

  const handleSelectStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleAssign = async (mentorId) => {
    if (!authConfig) {
      toast.error('Faculty session expired. Please sign in again.');
      return;
    }

    if (selectedStudents.length === 0) {
      toast.warn('Please select at least one student to assign.');
      return;
    }

    try {
      setAssigningMentorId(mentorId);
      await Promise.all(
        selectedStudents.map((studentId) =>
          axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/faculty/assignMentor`,
            { student_id: studentId, mentor_id: mentorId },
            authConfig,
          ),
        ),
      );

      const mentor = mentors.find((item) => String(item.mentor_id) === String(mentorId));
      toast.success(
        `${selectedStudents.length} student(s) assigned to ${mentor?.full_name || 'the selected mentor'} successfully.`,
      );
      setSelectedStudents([]);
      await fetchAssignmentData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'An error occurred during assignment.');
    } finally {
      setAssigningMentorId(null);
    }
  };

  const resetMentorForm = () => {
    setEditingMentorId(null);
    setMentorForm({
      mentor_id: '',
      full_name: '',
      email: '',
      phone_number: '',
      reset_password: false,
    });
  };

  const handleEditMentor = (mentor) => {
    setEditingMentorId(mentor.mentor_id);
    setMentorForm({
      mentor_id: mentor.mentor_id || '',
      full_name: mentor.full_name || '',
      email: mentor.email || '',
      phone_number: mentor.phone_number || '',
      reset_password: false,
    });
  };

  const handleMentorFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setMentorForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveMentor = async (event) => {
    event.preventDefault();

    if (!authConfig) {
      toast.error('Faculty session expired. Please sign in again.');
      return;
    }

    if (!mentorForm.full_name.trim() || !mentorForm.email.trim()) {
      toast.warn('Mentor name and email are required.');
      return;
    }

    try {
      setSavingMentor(true);
      const payload = {
        mentor_id: mentorForm.mentor_id.trim(),
        full_name: mentorForm.full_name.trim(),
        email: mentorForm.email.trim(),
        phone_number: mentorForm.phone_number.trim(),
        reset_password: mentorForm.reset_password,
      };

      if (editingMentorId) {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/faculty/mentors/${encodeURIComponent(editingMentorId)}`,
          payload,
          authConfig,
        );
        toast.success('Faculty mentor updated successfully.');
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/mentors`, payload, authConfig);
        toast.success('Faculty mentor registered. Default password is name + email.');
      }

      resetMentorForm();
      await fetchAssignmentData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save faculty mentor.');
    } finally {
      setSavingMentor(false);
    }
  };

  const handleDeleteMentor = async (mentorId) => {
    if (!authConfig || !mentorId) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/faculty/mentors/${encodeURIComponent(mentorId)}`,
        authConfig,
      );
      toast.success('Faculty mentor deactivated. History remains in the database.');
      if (editingMentorId === mentorId) resetMentorForm();
      await fetchAssignmentData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to deactivate faculty mentor.');
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <ToastContainer theme="dark" position="bottom-right" />
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Assign Mentors</h2>
        <p className="text-slate-500 text-sm mt-1">Connect students with academic mentors for technical guidance.</p>
      </header>

      <form onSubmit={handleSaveMentor} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">
              {editingMentorId ? 'Edit Faculty Mentor' : 'Register Faculty Mentor'}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
              Default password: mentor name + email
            </p>
          </div>
          {editingMentorId && (
            <button
              type="button"
              onClick={resetMentorForm}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancel Edit
            </button>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <input
            name="mentor_id"
            value={mentorForm.mentor_id}
            onChange={handleMentorFormChange}
            disabled={Boolean(editingMentorId)}
            placeholder="Mentor ID (optional)"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <input
            name="full_name"
            value={mentorForm.full_name}
            onChange={handleMentorFormChange}
            placeholder="Full name"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <input
            name="email"
            type="email"
            value={mentorForm.email}
            onChange={handleMentorFormChange}
            placeholder="Email"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <input
            name="phone_number"
            value={mentorForm.phone_number}
            onChange={handleMentorFormChange}
            placeholder="Phone"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-500">
            <input
              name="reset_password"
              type="checkbox"
              checked={mentorForm.reset_password}
              onChange={handleMentorFormChange}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            Reset password to name + email
          </label>
          <button
            type="submit"
            disabled={savingMentor}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-700 disabled:opacity-60"
          >
            {savingMentor ? 'Saving...' : editingMentorId ? 'Update Mentor' : 'Register Mentor'}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Panel: Students */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[600px] overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="font-bold text-slate-800 dark:text-white">Pending Assignments</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{filteredUnassignedStudents.length} Students Needing Mentors</p>
            <select
              value={selectedDepartment}
              onChange={(event) => {
                setSelectedDepartment(event.target.value);
                setSelectedStudents([]);
              }}
              className="mt-4 w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {departments.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar relative">
            {loading ? (
               <div className="flex justify-center items-center h-full text-indigo-500">
                 <FontAwesomeIcon icon={faSpinner} spin size="2x" />
               </div>
            ) : filteredUnassignedStudents.length > 0 ? filteredUnassignedStudents.map((s) => {
               const sId = s.student_id || s.id;
               return (
                <div key={sId} className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group cursor-pointer shadow-sm hover:shadow-md" onClick={() => handleSelectStudent(sId)}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all text-lg shadow-sm">
                      {(s.full_name || s.student_name || s.name || 'S').charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{s.full_name || s.student_name || s.name || 'Student'}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{s.department || s.dept || 'Not Specified'}</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={selectedStudents.includes(sId)}
                    readOnly
                    className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-300 pointer-events-none" 
                  />
                </div>
               )
            }) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <p className="font-bold text-slate-600 dark:text-slate-300">All Set!</p>
                <p className="text-xs text-slate-400 mt-1">No students pending academic mentor assignment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Mentors */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[600px] overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="font-bold text-slate-800 dark:text-white">Available Mentors</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Faculty Supervision Load</p>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {mentors.map((m) => {
              const mentorId = m.mentor_id || m.id;
              const load = Number(m.assigned_students_count || m.load || 0);
              const remainingSlots = Math.max(0, 10 - load);
              const wouldExceedLimit = selectedStudents.length > remainingSlots;
              return (
              <div key={mentorId} className={`p-6 rounded-2xl border transition-all shadow-sm ${
                load >= 10 
                  ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 opacity-60 grayscale' 
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-indigo-500/30 dark:hover:border-indigo-500/50'
              }`}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-lg">{m.full_name || m.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{m.email || 'Mentor account'}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditMentor(m)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMentor(mentorId)}
                      className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-600 transition-all hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30"
                    >
                      Delete
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleAssign(mentorId)}
                      disabled={load >= 10 || selectedStudents.length === 0 || wouldExceedLimit || assigningMentorId === mentorId}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 uppercase tracking-wider ${
                        load >= 10 || selectedStudents.length === 0 || wouldExceedLimit || assigningMentorId === mentorId
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 shadow-none cursor-not-allowed border border-slate-200 dark:border-slate-700' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20 border border-indigo-600'
                      }`}
                    >
                      {assigningMentorId === mentorId ? 'Assigning...' : wouldExceedLimit ? `${remainingSlots} slot(s) left` : 'Assign'}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-400">Student Load</span>
                    <span className={load >= 9 ? 'text-rose-500' : 'text-indigo-500'}>{load} / 10</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${load >= 9 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`} 
                      style={{ width: `${Math.min(load * 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyAssignMentors;
