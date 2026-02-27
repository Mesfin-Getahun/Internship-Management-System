import React, { useState, useEffect } from 'react';
import SkillsInput from './SkillsInput';

// --- Mock Data ---
const allTechnicalSkills = ["JavaScript", "React", "Node.js", "Python", "Java", "C++", "HTML", "CSS", "SQL", "MongoDB", "Firebase", "Docker", "Git", "TypeScript", "Vue.js", "Angular", "PHP", "Laravel", "Ruby on Rails", "AWS", "Azure"];
const allSoftSkills = ["Communication", "Teamwork", "Problem Solving", "Leadership", "Time Management", "Adaptability", "Creativity", "Work Ethic", "Interpersonal Skills", "Critical Thinking"];
const allLanguages = ["English", "Amharic", "Spanish", "French", "German", "Mandarin", "Hindi", "Arabic"];

// --- Helper Components ---
const SectionHeader = ({ title }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
    <div className="w-16 h-0.5 bg-blue-600 mt-1"></div>
  </div>
);

const InputField = ({ name, label, required = false, type = 'text', readOnly = false, value, onChange, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children ? (
      React.cloneElement(children, { name, value, onChange, required, className: `input-field ${readOnly ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : 'bg-slate-200 dark:bg-slate-700'}` })
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`input-field ${readOnly ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : 'bg-slate-200 dark:bg-slate-700'}`}
        required={required}
      />
    )}
  </div>
);

// --- Main Form Component ---
const ProfileForm = ({ studentData, onSave, isSetupMode = false }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    universityEmail: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    department: '',
    program: '',
    academicYear: '',
    currentSemester: '',
    gpa: '',
    expectedGraduationYear: '',
    technicalSkills: [],
    softSkills: [],
    languages: [],
    linkedin: '',
    github: '',
    portfolio: '',
    cv: null,
    ...studentData, // Pre-fill with existing data
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (name, skills) => {
    setFormData(prev => ({ ...prev, [name]: skills }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, cv: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* Personal Information */}
      <section>
        <SectionHeader title="Personal Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField name="fullName" label="Full Name" required value={formData.fullName} onChange={handleChange} />
          <InputField name="studentId" label="Student ID" required readOnly={!isSetupMode} value={formData.studentId} onChange={handleChange} />
          <InputField name="universityEmail" label="University Email" required type="email" readOnly={!isSetupMode} value={formData.universityEmail} onChange={handleChange} />
          <InputField name="phoneNumber" label="Phone Number" required type="tel" value={formData.phoneNumber} onChange={handleChange} />
          <InputField name="gender" label="Gender" required value={formData.gender} onChange={handleChange}>
            <select>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </InputField>
          <InputField name="dateOfBirth" label="Date of Birth" required type="date" value={formData.dateOfBirth} onChange={handleChange} />
        </div>
      </section>

      {/* Academic Information */}
      <section>
        <SectionHeader title="Academic Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField name="department" label="Department" required readOnly={!isSetupMode} value={formData.department} onChange={handleChange} />
          <InputField name="program" label="Program" readOnly={!isSetupMode} value={formData.program} onChange={handleChange} />
          <InputField name="academicYear" label="Academic Year" required readOnly={!isSetupMode} value={formData.academicYear} onChange={handleChange} />
          <InputField name="currentSemester" label="Current Semester" value={formData.currentSemester} onChange={handleChange} />
          <InputField name="gpa" label="GPA (0.0-4.0)" required type="number" value={formData.gpa} onChange={handleChange} />
          <InputField name="expectedGraduationYear" label="Expected Graduation Year" readOnly={!isSetupMode} value={formData.expectedGraduationYear} onChange={handleChange} />
        </div>
      </section>

      {/* Skills & Competencies */}
      <section>
        <SectionHeader title="Skills & Competencies" />
        <div className="space-y-6">
          <SkillsInput label="Technical Skills" allSkills={allTechnicalSkills} selectedSkills={formData.technicalSkills} onChange={(skills) => handleSkillsChange('technicalSkills', skills)} placeholder="Search and select technical skills" required />
          <SkillsInput label="Soft Skills" allSkills={allSoftSkills} selectedSkills={formData.softSkills} onChange={(skills) => handleSkillsChange('softSkills', skills)} placeholder="Search and select soft skills" required />
          <SkillsInput label="Languages Spoken" allSkills={allLanguages} selectedSkills={formData.languages} onChange={(skills) => handleSkillsChange('languages', skills)} placeholder="Search and select languages" />
        </div>
      </section>

      {/* Professional Information */}
      <section>
        <SectionHeader title="Professional Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField name="linkedin" label="LinkedIn URL" value={formData.linkedin} onChange={handleChange} />
          <InputField name="github" label="GitHub URL" value={formData.github} onChange={handleChange} />
          <div className="md:col-span-2">
            <InputField name="portfolio" label="Portfolio URL" value={formData.portfolio} onChange={handleChange} />
          </div>
          <div className="md:col-span-2">
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CV Upload (PDF) <span className="text-red-500">*</span></label>
             <input type="file" onChange={handleFileChange} accept=".pdf" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900" />
             {formData.cv && <p className="text-xs text-green-600 mt-1">File selected: {typeof formData.cv === 'string' ? formData.cv : formData.cv.name}</p>}
          </div>
        </div>
      </section>

      <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 hover:bg-blue-700"
        >
          {isSetupMode ? 'Save and Continue' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
