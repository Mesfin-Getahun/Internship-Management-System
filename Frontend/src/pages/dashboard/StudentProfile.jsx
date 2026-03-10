import React from "react";
import { useAuth } from "../../AuthContext";
import ProfileForm from "../../components/setup/ProfileForm"; // We will create this component next
import axios from "axios";
const StudentProfile = () => {
  const { user, login } = useAuth();

  const handleUpdate = async (updatedData) => {
    console.log("Updating profile...", updatedData);
    try {
      const res = await axios.put(
        "http://localhost:5000/api/student/updateProfile",
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // After saving, fetch updated user
      const me = await axios.get("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      login({
        user: me.data.user,
        role: me.data.user.role,
        firstLogin: me.data.user.isFirstLogin,
      });
      navigate("/student");
    } catch (error) {
      console.error(error.response?.data || error.message);
    }

    // In a real app, you would send this to a backend API
    // For now, we'll just update the user in our local state/context
    // const updatedUser = { ...user, ...updatedData };
    // login(updatedUser); // login function also serves to update user data
    // alert("Profile updated successfully!");
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white">
          My Profile
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          View and update your personal, academic, and professional information.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200 dark:border-slate-700">
        <ProfileForm studentData={user} onSave={handleUpdate} />
      </div>
    </div>
  );
};

export default StudentProfile;
