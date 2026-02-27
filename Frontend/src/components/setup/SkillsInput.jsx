import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const SkillsInput = ({
  label,
  allSkills,
  selectedSkills,
  onChange,
  placeholder,
  required = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (!isDropdownOpen) {
      setIsDropdownOpen(true);
    }
  };

  const handleSelectSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      onChange([...selectedSkills, skill]);
    }
    setInputValue('');
    setIsDropdownOpen(false);
  };

  const handleRemoveSkill = (skillToRemove) => {
    onChange(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const filteredSkills = allSkills.filter(skill =>
    skill.toLowerCase().includes(inputValue.toLowerCase()) && !selectedSkills.includes(skill)
  );

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className="input-field flex flex-wrap items-center gap-2 p-2 bg-slate-200 dark:bg-slate-700"
        onClick={() => setIsDropdownOpen(true)}
      >
        {selectedSkills.map(skill => (
          <span key={skill} className="flex items-center bg-blue-500 text-white text-sm font-medium px-2 py-1 rounded-md">
            {skill}
            <button
              type="button"
              className="ml-2 text-blue-200 hover:text-white"
              onClick={(e) => {
                e.stopPropagation(); // prevent dropdown from opening
                handleRemoveSkill(skill);
              }}
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder={selectedSkills.length === 0 ? placeholder : ''}
          className="flex-grow bg-transparent outline-none text-sm"
        />
      </div>
      {isDropdownOpen && filteredSkills.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1">
            {filteredSkills.map(skill => (
              <li
                key={skill}
                className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                onClick={() => handleSelectSkill(skill)}
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default React.memo(SkillsInput);
