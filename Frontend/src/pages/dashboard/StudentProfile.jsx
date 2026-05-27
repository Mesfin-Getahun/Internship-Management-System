import React, { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import ProfileForm from '../../components/setup/ProfileForm'; // We will create this component next
import axios from 'axios';

const StudentProfile = () => {
  const { user, login } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.token) {
      setLoadingProfile(false);
      return;
    }

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/student/profile`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((response) => {
        const updatedUser = {
          ...user,
          ...(response.data?.student || {}),
          token: user.token,
          role: user.role,
          isFirstLogin: user.isFirstLogin,
        };
        login(updatedUser);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load student profile.');
      })
      .finally(() => setLoadingProfile(false));
  }, [user?.token]);

  const handleUpdate = async (updatedData) => {
    setSaving(true);
    setMessage('');
    setError('');

    const payload = {
      full_name: updatedData.fullName,
      email: updatedData.universityEmail,
      phone_number: updatedData.phoneNumber,
      gender: updatedData.gender,
      date_of_birth: updatedData.dateOfBirth,
      program: updatedData.program,
      academic_year: updatedData.academicYear,
      current_semester: updatedData.currentSemester,
      cgpa: updatedData.gpa,
      expected_graduation_year: updatedData.expectedGraduationYear,
      skills: updatedData.technicalSkills?.join(', '),
      technical_skills: updatedData.technicalSkills || [],
      soft_skills: updatedData.softSkills || [],
      languages: updatedData.languages || [],
      linkedin: updatedData.linkedin,
      github: updatedData.github,
      portfolio: updatedData.portfolio,
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/student/updateProfile`,
        payload,
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );

      const updatedUser = {
        ...user,
        ...(response.data?.student || {}),
        token: user?.token,
        role: user?.role,
        isFirstLogin: user?.isFirstLogin,
      };

      login(updatedUser);
      setMessage(response.data?.message || 'Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">View and update your personal, academic, and professional information.</p>
      </header>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200 dark:border-slate-700">
        {message && <p className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p>}
        {error && <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
        {saving && <p className="mb-6 text-sm font-bold text-blue-600">Saving profile changes...</p>}
        {loadingProfile ? (
          <p className="text-sm font-bold text-blue-600">Loading student profile...</p>
        ) : (
          <ProfileForm studentData={user} onSave={handleUpdate} />
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
