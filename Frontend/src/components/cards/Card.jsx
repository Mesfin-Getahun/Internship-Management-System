import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Card = ({ 
  title, 
  type, 
  company, 
  companyIcon, 
  description, 
  location, 
  locationIcon, 
  duration, 
  durationIcon, 
  skills, 
  applyLink 
}) => {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
      style={{ 
        boxShadow: "0 0 20px rgba(30, 77, 181, 0.1), 0 4px 15px rgba(0, 0, 0, 0.05)"
      }}
    >
      {/* Header: Title and Type Badge */}
      <div className="flex justify-between items-start mb-4">
        <h3 
          className="text-lg font-bold text-gray-900 dark:text-white pr-2"
          style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
        >
          {title}
        </h3>
        <span className="px-3 py-1 bg-[#1e4db5]/10 dark:bg-[#3b82f6]/20 text-[#1e4db5] dark:text-[#60a5fa] text-xs font-semibold rounded-full whitespace-nowrap border border-[#1e4db5]/20 dark:border-[#3b82f6]/30">
          {type}
        </span>
      </div>

      {/* Company */}
      <div className="flex items-center gap-2 mb-3 text-gray-600 dark:text-gray-400">
        <FontAwesomeIcon icon={companyIcon} className="text-sm" />
        <span className="text-sm font-medium">{company}</span>
      </div>

      {/* Description - Fixed height for consistency */}
      <div className="mb-4 min-h-[60px]">
        <p 
          className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed"
          style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
        >
          {description}
        </p>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-400">
        <FontAwesomeIcon icon={locationIcon} className="text-sm text-[#1e4db5] dark:text-[#60a5fa]" />
        <span className="text-sm">{location}</span>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-400">
        <FontAwesomeIcon icon={durationIcon} className="text-sm text-[#1e4db5] dark:text-[#60a5fa]" />
        <span className="text-sm">{duration}</span>
      </div>

      {/* Skills Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {skills.map((skill, index) => (
          <span 
            key={index}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md border border-gray-200 dark:border-gray-600"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Apply Button - Light blue before hover, darker blue on hover */}
      <a
  href={applyLink}
  className="block w-full py-3 px-4 bg-[#bfdbfe] dark:bg-[#1e40af]/50 text-[#1e3a8a] dark:text-white hover:bg-[#1e4db5] hover:text-white dark:hover:bg-[#3b82f6] text-center font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-[#1e4db5]/30 border-2 border-[#3b82f6] dark:border-[#60a5fa]"
  style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
>
  Apply Now
</a>
    </div>
  );
};

export default Card;