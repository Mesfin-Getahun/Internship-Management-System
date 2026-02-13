
import React, { useState } from 'react';

const ProfileSetup = ({ role, onFinish }) => {
  // This component is now exclusively for Students
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    gender: '',
    department: '',
    academicYear: '',
    major: '',
    gpa: '',
    skills: ''
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (formData.fullName.length < 3) newErrors.fullName = "Name is too short.";
    if (!/^\+?[0-9]{10,14}$/.test(formData.phone)) newErrors.phone = "Invalid phone format.";
    if (!formData.gender) newErrors.gender = "Selection required.";
    if (!formData.department) newErrors.department = "Required.";
    if (!formData.major) newErrors.major = "Required.";
    if (!formData.gpa || formData.gpa < 0 || formData.gpa > 4) newErrors.gpa = "Enter valid GPA (0-4).";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onFinish(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 mb-4">
        <h4 className="text-blue-800 dark:text-blue-400 font-bold text-sm mb-1 text-center">Student Academic Profile</h4>
        <p className="text-blue-600 dark:text-blue-500 text-[11px] text-center italic leading-tight">
          Your profile information helps the system recommend internship opportunities that match your skills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-sm">Full Name (Academic Record)</label>
          <input 
            type="text" required placeholder="Enter full legal name" 
            className={`w-full px-4 py-3 rounded-xl border ${errors.fullName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`} 
            value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
          />
          {errors.fullName && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-sm">Department</label>
          <select 
            required 
            className={`w-full px-4 py-3 rounded-xl border ${errors.department ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
          >
            <option value="">Select Department</option>
            <option>Software Engineering</option><option>Civil Engineering</option><option>Electrical Engineering</option><option>Mechanical Engineering</option><option>Chemical Engineering</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-sm">Major / Stream</label>
          <input 
            type="text" required placeholder="e.g. AI & Data Science" 
            className={`w-full px-4 py-3 rounded-xl border ${errors.major ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-sm">Academic Year</label>
          <select required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})}>
            <option value="">Select Year</option>
            <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option><option>5th Year</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-sm">Cumulative GPA</label>
          <input 
            type="number" step="0.01" min="0" max="4" required placeholder="0.00 - 4.00" 
            className={`w-full px-4 py-3 rounded-xl border ${errors.gpa ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={formData.gpa} onChange={e => setFormData({...formData, gpa: e.target.value})}
          />
          {errors.gpa && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.gpa}</p>}
        </div>

        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-sm">Gender</label>
          <div className="flex gap-4 mt-2">
            {['Male', 'Female'].map(g => (
              <label key={g} className="flex items-center cursor-pointer group">
                <input 
                  type="radio" name="gender" required 
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:bg-slate-800 border-slate-300 dark:border-slate-700" 
                  checked={formData.gender === g}
                  onChange={() => setFormData({...formData, gender: g})}
                />
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400 group-hover:text-blue-600 transition-colors">{g}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-sm">Phone Number</label>
          <input 
            type="tel" required placeholder="+251 9..." 
            className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
          />
          {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase">{errors.phone}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 text-sm">Technical Skills (Keywords)</label>
          <input 
            type="text" placeholder="e.g. React, CAD Design, SQL, Project Mgmt" 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})}
          />
          <p className="text-[10px] text-slate-400 mt-1">Separate skills with commas. This helps organizations find your profile.</p>
        </div>
      </div>

      <div className="pt-6">
        <button type="submit" className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
          Complete Account Setup
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default ProfileSetup;
