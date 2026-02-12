import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faLaptopCode, 
  faChartLine, 
  faUsers, 
  faBriefcase, 
  faBookOpen 
} from "@fortawesome/free-solid-svg-icons";

const benefits = [
  {
    icon: faLaptopCode,
    title: "Gain Real-World Experience",
    description: "Work on actual projects and challenges faced by professionals in your field"
  },
  {
    icon: faChartLine,
    title: "Improve Professional Skills",
    description: "Develop communication, teamwork, time management, and problem-solving abilities"
  },
  {
    icon: faUsers,
    title: "Build Industry Connections",
    description: "Network with professionals, mentors, and peers who can support your career growth"
  },
  {
    icon: faBriefcase,
    title: "Increase Employability",
    description: "Stand out to employers with proven experience and demonstrated capabilities"
  },
  {
    icon: faBookOpen,
    title: "Apply Academic Knowledge",
    description: "See how your coursework translates into practical applications and solutions"
  }
];

const Benefits = () => {
  const firstRow = benefits.slice(0, 3);
  const secondRow = benefits.slice(3, 5);

  return (
    <section id="benefits" className="relative w-full py-20 md:py-28 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4db5] to-transparent opacity-20" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
          >
            Benefits of Internship
          </h2>
          <div className="w-24 h-1 bg-[#1e4db5] mx-auto rounded-full mb-6" />
          <p 
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
          >
            Discover how internships can transform your academic journey into a successful career path
          </p>
        </div>

        {/* Grid Layout - 3 columns, 2 rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* First Row - 3 boxes */}
          {firstRow.map((benefit, index) => (
            <div
              key={index}
              className="group relative bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
              style={{ 
                boxShadow: "0 0 30px rgba(30, 77, 181, 0.15), 0 4px 20px rgba(0, 0, 0, 0.08)"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1e4db5]/5 to-[#3b82f6]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-[#1e4db5]/10 flex items-center justify-center mb-5 group-hover:bg-[#1e4db5]/20 transition-colors duration-300">
                  <FontAwesomeIcon 
                    icon={benefit.icon} 
                    className="text-2xl text-[#1e4db5]" 
                  />
                </div>

                <h3 
                  className="text-lg font-bold text-gray-900 dark:text-white mb-3"
                  style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                >
                  {benefit.title}
                </h3>

                <p 
                  className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed"
                  style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
                >
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}

          {/* Second Row - 2 boxes aligned left (span first 2 columns) */}
          {secondRow.map((benefit, index) => (
            <div
              key={index + 3}
              className="group relative bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
              style={{ 
                boxShadow: "0 0 30px rgba(30, 77, 181, 0.15), 0 4px 20px rgba(0, 0, 0, 0.08)"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1e4db5]/5 to-[#3b82f6]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-[#1e4db5]/10 flex items-center justify-center mb-5 group-hover:bg-[#1e4db5]/20 transition-colors duration-300">
                  <FontAwesomeIcon 
                    icon={benefit.icon} 
                    className="text-2xl text-[#1e4db5]" 
                  />
                </div>

                <h3 
                  className="text-lg font-bold text-gray-900 dark:text-white mb-3"
                  style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                >
                  {benefit.title}
                </h3>

                <p 
                  className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed"
                  style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
                >
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;