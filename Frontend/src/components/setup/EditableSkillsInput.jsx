import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

const EditableSkillsInput = ({
  label,
  selectedSkills,
  onChange,
  placeholder,
  required = false
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddSkill = () => {
    if (inputValue.trim() && !selectedSkills.includes(inputValue.trim())) {
      onChange([...selectedSkills, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    onChange(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-slate-200 dark:bg-slate-700 border border-transparent focus-within:border-blue-500">
        {selectedSkills.map(skill => (
          <span key={skill} className="flex items-center bg-blue-500 text-white text-sm font-medium px-2 py-1 rounded-md">
            {skill}
            <button
              type="button"
              className="ml-2 text-blue-200 hover:text-white"
              onClick={() => handleRemoveSkill(skill)}
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-grow bg-transparent outline-none text-sm"
        />
         <button
          type="button"
          onClick={handleAddSkill}
          className="p-1 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

export default EditableSkillsInput;
