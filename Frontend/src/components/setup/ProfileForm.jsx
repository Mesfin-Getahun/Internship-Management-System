import React, { useState, useEffect } from 'react';
import EditableSkillsInput from './EditableSkillsInput';



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

const toExternalUrl = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const LinkInputField = ({ name, label, value, onChange }) => {
  const href = toExternalUrl(value);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            Open link
          </a>
        )}
      </div>
      <input
        type="url"
        name={name}
        value={value}
        onChange={onChange}
        placeholder="https://example.com/profile"
        className="input-field bg-slate-200 dark:bg-slate-700"
      />
    </div>
  );
};

// --- Main Form Component ---
const parseList = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : value.split(',').map((item) => item.trim()).filter(Boolean);
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
};

const formatDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
};

const normalizeStudentData = (studentData = {}) => ({
  ...studentData,
  fullName: studentData.fullName || studentData.full_name || '',
  studentId: studentData.studentId || studentData.student_id || '',
  universityEmail: studentData.universityEmail || studentData.email || '',
  phoneNumber: studentData.phoneNumber || studentData.phone_number || '',
  gender: studentData.gender || '',
  dateOfBirth: formatDateInput(studentData.dateOfBirth || studentData.date_of_birth),
  program: studentData.program || '',
  academicYear: studentData.academicYear || studentData.academic_year || '',
  currentSemester: studentData.currentSemester || studentData.current_semester || '',
  gpa: studentData.gpa || studentData.cgpa || '',
  expectedGraduationYear:
    studentData.expectedGraduationYear || studentData.expected_graduation_year || '',
  technicalSkills: parseList(studentData.technicalSkills || studentData.technical_skills || studentData.skills),
  softSkills: parseList(studentData.softSkills || studentData.soft_skills),
  languages: parseList(studentData.languages),
  linkedin: studentData.linkedin || '',
  github: studentData.github || '',
  portfolio: studentData.portfolio || '',
});

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
    ...normalizeStudentData(studentData), // Pre-fill with existing data
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...normalizeStudentData(studentData),
    }));
  }, [studentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (name, skills) => {
    setFormData(prev => ({ ...prev, [name]: skills }));
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
          <EditableSkillsInput label="Technical Skills" selectedSkills={formData.technicalSkills} onChange={(skills) => handleSkillsChange('technicalSkills', skills)} placeholder="Add a technical skill" required />
          <EditableSkillsInput label="Soft Skills" selectedSkills={formData.softSkills} onChange={(skills) => handleSkillsChange('softSkills', skills)} placeholder="Add a soft skill" required />
          <EditableSkillsInput label="Languages Spoken" selectedSkills={formData.languages} onChange={(skills) => handleSkillsChange('languages', skills)} placeholder="Add a language" />
        </div>
      </section>

      {/* Professional Information */}
      <section>
        <SectionHeader title="Professional Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LinkInputField name="linkedin" label="LinkedIn URL" value={formData.linkedin} onChange={handleChange} />
          <LinkInputField name="github" label="GitHub URL" value={formData.github} onChange={handleChange} />
          <div className="md:col-span-2">
            <LinkInputField name="portfolio" label="Portfolio URL" value={formData.portfolio} onChange={handleChange} />
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
