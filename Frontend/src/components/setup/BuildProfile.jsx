import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import ProfileForm from './ProfileForm';
import axios from 'axios';

const BuildProfile = () => {
  const navigate = useNavigate();
  const { user, completeSetup, login } = useAuth();

  const handleSave = async (formData) => {
    const payload = {
      full_name: formData.fullName,
      email: formData.universityEmail,
      phone_number: formData.phoneNumber,
      skills: formData.technicalSkills?.join(', '),
      technical_skills: formData.technicalSkills || [],
      soft_skills: formData.softSkills || [],
      languages: formData.languages || [],
      linkedin: formData.linkedin,
      github: formData.github,
      portfolio: formData.portfolio,
    };

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
      isFirstLogin: false,
    };
    login(updatedUser); // Update the user in context
    completeSetup(); // This might be redundant if login handles the persistence
    navigate('/student');
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Complete Your Student Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Please provide your academic and professional information before accessing your dashboard.</p>
      </div>
      
      {/* We can add the progress bar back if needed, but it requires more logic */}
      
      <ProfileForm studentData={user} onSave={handleSave} isSetupMode={true} />
    </div>
  );
};

export default BuildProfile;
