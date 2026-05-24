import React, { useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faBriefcase, faSpinner, faUserMinus, faUserPen, faUpload, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getDepartmentOptions, matchesDepartment } from '../../../utils/departmentFilters';

const getProfileStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase();

  if (['complete', 'completed', 'profile_complete'].includes(normalized)) {
    return {
      label: 'Complete',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
  }

  return {
    label: 'Incomplete',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };
};

const DetailModal = ({ title, icon, fields, onClose }) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
    <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
            <FontAwesomeIcon icon={icon} />
          </div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="grid gap-4 p-6 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            <p className="mt-2 break-words text-sm font-bold text-slate-700 dark:text-slate-200">{value || 'Not available'}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const FacultyManageStudentsLive = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mentors, setMentors] = useState([]);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [newMentorId, setNewMentorId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const authConfig = user?.token
    ? { headers: { Authorization: `Bearer ${user.token}` } }
    : null;

  const fetchData = async () => {
    if (!authConfig) {
      setLoading(false);
      setError('Faculty session token is missing. Please sign in again.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const [studentsRes, mentorsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/students`, authConfig),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/mentors`, authConfig),
      ]);
      setStudents(Array.isArray(studentsRes.data?.students) ? studentsRes.data.students : []);
      setMentors(Array.isArray(mentorsRes.data?.mentors) ? mentorsRes.data.mentors : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load students.');
      setStudents([]);
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.token]);

  const departments = useMemo(() => getDepartmentOptions(students), [students]);

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return students.filter((student) => {
      if (!matchesDepartment(student, selectedDepartment)) return false;
      if (!query) return true;

      const name = (student.full_name || '').toLowerCase();
      const id = String(student.student_id || '').toLowerCase();
      const department = (student.department || '').toLowerCase();
      const company = (student.company_name || '').toLowerCase();

      return (
        name.includes(query) ||
        id.includes(query) ||
        department.includes(query) ||
        company.includes(query)
      );
    });
  }, [searchTerm, selectedDepartment, students]);

  const getPlacementLabel = (student) => {
    if (!student.internship_id) return 'Not Placed';
    return student.internship_status || 'Assigned';
  };

  const openStudentDetails = (student) => {
    const profileStatus = getProfileStatus(student.profile_status);
    setDetailModal({
      title: student.full_name || 'Student Details',
      icon: faEye,
      fields: [
        ['Student ID', student.student_id],
        ['Full Name', student.full_name],
        ['Email', student.email],
        ['Department', student.department],
        ['Profile Status', profileStatus.label],
        ['University Mentor', student.university_mentor_name || 'Not Assigned'],
      ],
    });
  };

  const openInternshipDetails = (student) => {
    setDetailModal({
      title: student.internship_title || 'Internship Details',
      icon: faBriefcase,
      fields: [
        ['Placement Status', getPlacementLabel(student)],
        ['Internship Title', student.internship_title],
        ['Organization', student.company_name],
        ['Placement Start', student.placement_start_date ? new Date(student.placement_start_date).toLocaleDateString() : null],
        ['Internship Start', student.start_date ? new Date(student.start_date).toLocaleDateString() : null],
        ['Internship End', student.end_date ? new Date(student.end_date).toLocaleDateString() : null],
      ],
    });
  };

  const handleDeleteMentor = async (studentId) => {
    if (!authConfig) return;

    try {
      setActionLoading(true);
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/faculty/deleteMentor/${encodeURIComponent(studentId)}`, authConfig);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to remove mentor.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeMentor = async (studentId) => {
    if (!authConfig || !newMentorId) return;

    try {
      setActionLoading(true);
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/faculty/changeMentor/${encodeURIComponent(studentId)}`,
        { new_mentor_id: newMentorId },
        authConfig,
      );
      setEditingStudentId(null);
      setNewMentorId('');
      await fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to change mentor.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/faculty/uploadStudents`,
        formData,
        {
          headers: {
            ...authConfig.headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      alert(res.data.message || 'Students uploaded successfully');
      await fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to upload students');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Manage Students</h2>
          <p className="text-slate-500 text-sm mt-1">Students listed here are fetched from the logged-in faculty&apos;s department only.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
          <select
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all w-full sm:w-56"
          >
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, ID, dept, or company..."
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all w-full sm:w-72"
          />
          <input 
            type="file" 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-70"
          >
            {uploading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faUpload} />}
            Upload CSV/Excel
          </button>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-indigo-500">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 text-slate-500 dark:text-slate-400 px-6 text-center">
            <p>{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest">Student Information</th>
                  <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-center">Internship</th>
                  <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-center">University Mentor</th>
                  <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-center">Profile Status</th>
                  <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((student) => {
                  const profileStatus = getProfileStatus(student.profile_status);

                  return (
                  <tr key={student.student_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-5">
                      <div className="font-bold text-slate-800 dark:text-white">{student.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {student.student_id} | {student.department || 'No Department'}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{student.email || 'No email provided'}</div>
                    </td>
                    <td className="p-5 text-center">
                      <div className="text-sm font-black text-slate-700 dark:text-slate-300">
                        {student.internship_title || 'No internship'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                        {student.company_name || getPlacementLabel(student)}
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      {editingStudentId === student.student_id ? (
                        <div className="flex flex-col gap-2 items-center">
                          <select
                            value={newMentorId}
                            onChange={(event) => setNewMentorId(event.target.value)}
                            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          >
                            <option value="">Select mentor</option>
                            {mentors.map((mentor) => (
                              <option key={mentor.mentor_id} value={mentor.mentor_id}>
                                {mentor.full_name}
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleChangeMentor(student.student_id)}
                              disabled={actionLoading || !newMentorId}
                              className="px-3 py-1 text-[10px] font-black uppercase rounded-lg bg-indigo-600 text-white disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStudentId(null);
                                setNewMentorId('');
                              }}
                              className="px-3 py-1 text-[10px] font-black uppercase rounded-lg bg-slate-200 text-slate-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                          {student.university_mentor_name || 'Not Assigned'}
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${profileStatus.badge}`}>
                        {profileStatus.label}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          title="View student details"
                          onClick={() => openStudentDetails(student)}
                          className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-all"
                        >
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="View internship details"
                          onClick={() => openInternshipDetails(student)}
                          className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all"
                        >
                          <FontAwesomeIcon icon={faBriefcase} className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Change mentor"
                          onClick={() => {
                            setEditingStudentId(student.student_id);
                            setNewMentorId(student.university_mentor_id || '');
                          }}
                          className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all"
                        >
                          <FontAwesomeIcon icon={faUserPen} className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Delete mentor"
                          disabled={!student.university_mentor_id || actionLoading}
                          onClick={() => handleDeleteMentor(student.student_id)}
                          className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 transition-all disabled:opacity-50"
                        >
                          <FontAwesomeIcon icon={faUserMinus} className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-slate-500 dark:text-slate-400">
                      No students matched your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {detailModal && (
        <DetailModal
          title={detailModal.title}
          icon={detailModal.icon}
          fields={detailModal.fields}
          onClose={() => setDetailModal(null)}
        />
      )}
    </div>
  );
};

export default FacultyManageStudentsLive;
