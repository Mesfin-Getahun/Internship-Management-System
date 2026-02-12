import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faGraduationCap, faNetworkWired } from "@fortawesome/free-solid-svg-icons";

const features = [
  {
    icon: faBriefcase,
    title: "Practical Experience",
    description: "Apply classroom knowledge to real-world professional environments"
  },
  {
    icon: faGraduationCap,
    title: "Skill Development",
    description: "Develop essential workplace skills and professional competencies"
  },
  {
    icon: faNetworkWired,
    title: "Industry Exposure",
    description: "Gain insights into industry practices and build professional networks"
  }
];

const About = () => {
  return (
    <section id="about" className="relative w-full py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Subtle BDU blue background accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4db5] to-transparent opacity-30" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
          >
            About Internships
          </h2>
          <div className="w-24 h-1 bg-[#1e4db5] mx-auto rounded-full" />
        </div>

        {/* Two Paragraphs */}
        <div className="max-w-4xl mx-auto space-y-6 mb-20">
          <p 
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed text-center"
            style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
          >
            Internships are structured work experiences that bridge the gap between academic learning and professional practice. They provide students with invaluable opportunities to apply theoretical knowledge in real-world settings while developing essential career skills.
          </p>
          <p 
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed text-center"
            style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
          >
            Through our platform, universities and organizations collaborate to create meaningful internship experiences that prepare students for successful careers while addressing industry needs.
          </p>
        </div>

        {/* Three Feature Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
              style={{ 
                boxShadow: "0 0 30px rgba(30, 77, 181, 0.15), 0 4px 20px rgba(0, 0, 0, 0.08)"
              }}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1e4db5]/5 to-[#3b82f6]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-[#1e4db5]/10 flex items-center justify-center mb-6 group-hover:bg-[#1e4db5]/20 transition-colors duration-300">
                  <FontAwesomeIcon 
                    icon={feature.icon} 
                    className="text-3xl text-[#1e4db5]" 
                  />
                </div>

                {/* Title */}
                <h3 
                  className="text-xl font-bold text-gray-900 dark:text-white mb-3"
                  style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p 
                  className="text-gray-600 dark:text-gray-400 leading-relaxed"
                  style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;