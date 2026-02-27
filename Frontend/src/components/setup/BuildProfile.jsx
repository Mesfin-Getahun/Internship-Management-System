import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import ProfileForm from './ProfileForm';

const BuildProfile = () => {
  const navigate = useNavigate();
  const { user, completeSetup, login } = useAuth();

  const handleSave = (formData) => {
    console.log("Submitting Profile:", formData);
    const updatedUser = { ...user, ...formData, isFirstLogin: false };
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
