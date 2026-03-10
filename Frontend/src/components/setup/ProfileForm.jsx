import React, { useState, useEffect } from "react";
import EditableSkillsInput from "./EditableSkillsInput";

// --- Helper Components ---
const SectionHeader = ({ title }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
      {title}
    </h2>
    <div className="w-16 h-0.5 bg-blue-600 mt-1"></div>
  </div>
);

const InputField = ({
  name,
  label,
  required = false,
  type = "text",
  readOnly = false,
  value,
  onChange,
  children,
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children ? (
      React.cloneElement(children, {
        name,
        value,
        onChange,
        required,
        className: `input-field ${
          readOnly
            ? "bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
            : "bg-slate-200 dark:bg-slate-700"
        }`,
      })
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`input-field ${
          readOnly
            ? "bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
            : "bg-slate-200 dark:bg-slate-700"
        }`}
        required={required}
      />
    )}
  </div>
);

// --- Main Form Component ---
const ProfileForm = ({ studentData, onSave, isSetupMode = false }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    universityEmail: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
    department: "",
    program: "",
    academicYear: "",
    currentSemester: "",
    gpa: "",
    expectedGraduationYear: "",
    technicalSkills: [],
    softSkills: [],
    languages: [],
    linkedin: "",
    github: "",
    portfolio: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (name, skills) => {
    console.log("Updated Skills:", name, skills);
    setFormData((prev) => ({ ...prev, [name]: skills }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  const safeParse = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return [];
  };
  useEffect(() => {
    if (studentData) {
      setFormData((prev) => ({
        ...prev,

        fullName: studentData.full_name || "",
        studentId: studentData.student_id || "",
        universityEmail: studentData.email || "",
        phoneNumber: studentData.phone_number || "",
        gender: studentData.gender || "",
        dateOfBirth: studentData.date_of_birth || "",
        department: studentData.department || "",
        academicYear: studentData.academic_year || "",
        program: studentData.program || "",
        currentSemester: studentData.current_semester || "",

        // technicalSkills: studentData.technical_skills
        //   ? JSON.parse(studentData.technical_skills)
        //   : [],

        // softSkills: studentData.soft_skills
        //   ? JSON.parse(studentData.soft_skills)
        //   : [],

        // languages: studentData.languages
        //   ? JSON.parse(studentData.languages)
        //   : [],

        technicalSkills: safeParse(studentData.technical_skills),
        softSkills: safeParse(studentData.soft_skills),
        languages: safeParse(studentData.languages),

        linkedin: studentData.linkedin || "",
        github: studentData.github || "",
        portfolio: studentData.portfolio || "",
      }));
    }
  }, [studentData]);
  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* Personal Information */}
      <section>
        <SectionHeader title="Personal Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            name="fullName"
            label="Full Name"
            required
            value={formData.fullName}
            onChange={handleChange}
            readOnly
          />
          <InputField
            name="studentId"
            label="Student ID"
            required
            // readOnly={!isSetupMode}
            readOnly
            value={formData.studentId}
            onChange={handleChange}
          />
          <InputField
            name="universityEmail"
            label="University Email"
            required
            type="email"
            readOnly
            // readOnly={!isSetupMode}
            value={formData.universityEmail}
            onChange={handleChange}
          />
          <InputField
            name="phoneNumber"
            label="Phone Number"
            required
            readOnly
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          <InputField
            name="gender"
            label="Gender"
            required
            readOnly
            value={formData.gender}
            onChange={handleChange}
          />

          <InputField
            name="dateOfBirth"
            label="Date of Birth"
            required
            type="date"
            readOnly
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
        </div>
      </section>

      {/* Academic Information */}
      <section>
        <SectionHeader title="Academic Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            name="department"
            label="Department"
            required
            // readOnly={!isSetupMode}
            value={formData.department}
            onChange={handleChange}
            readOnly
          />
          <InputField
            name="program"
            label="Program"
            // readOnly={!isSetupMode}
            readOnly
            value={formData.program}
            onChange={handleChange}
          />
          <InputField
            name="academicYear"
            label="Academic Year"
            required
            // readOnly={!isSetupMode}
            readOnly
            value={formData.academicYear}
            onChange={handleChange}
          />
          <InputField
            name="currentSemester"
            label="Current Semester"
            readOnly
            value={formData.currentSemester}
            onChange={handleChange}
          />
        </div>
      </section>

      {/* Skills & Competencies */}
      <section>
        <SectionHeader title="Skills & Competencies" />
        <div className="space-y-6">
          <EditableSkillsInput
            label="Technical Skills"
            selectedSkills={formData.technicalSkills}
            onChange={(skills) => handleSkillsChange("technicalSkills", skills)}
            placeholder="Add a technical skill"
            required
          />
          <EditableSkillsInput
            label="Soft Skills"
            selectedSkills={formData.softSkills}
            onChange={(skills) => handleSkillsChange("softSkills", skills)}
            placeholder="Add a soft skill"
            required
          />
          <EditableSkillsInput
            label="Languages Spoken"
            selectedSkills={formData.languages}
            onChange={(skills) => handleSkillsChange("languages", skills)}
            placeholder="Add a language"
          />
        </div>
      </section>

      {/* Professional Information */}
      <section>
        <SectionHeader title="Professional Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            name="linkedin"
            label="LinkedIn URL"
            value={formData.linkedin}
            onChange={handleChange}
          />
          <InputField
            name="github"
            label="GitHub URL"
            value={formData.github}
            onChange={handleChange}
          />
          <div className="md:col-span-2">
            <InputField
              name="portfolio"
              label="Portfolio URL"
              value={formData.portfolio}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 hover:bg-blue-700"
        >
          {isSetupMode ? "Save and Continue" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
