import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSignInAlt, faUserTie, faStar } from "@fortawesome/free-solid-svg-icons";

const steps = [
  {
    number: "01",
    icon: faSearch,
    title: "Explore Opportunities",
    description: "Browse through hundreds of internship positions from verified organizations across various fields and industries."
  },
  {
    number: "02",
    icon: faSignInAlt,
    title: "Login and Apply",
    description: "Create your account, complete your profile, and submit applications to positions that match your interests and skills."
  },
  {
    number: "03",
    icon: faUserTie,
    title: "Mentors Monitor Progress",
    description: "Work with assigned mentors who track your development, provide guidance, and ensure quality learning experiences."
  },
  {
    number: "04",
    icon: faStar,
    title: "Faculty Evaluates Performance",
    description: "Receive comprehensive evaluations from faculty members and industry supervisors to validate your internship experience."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative w-full py-20 md:py-28 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
          >
            How the System Works
          </h2>
          <p 
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
          >
            A simple, streamlined process from discovery to completion
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative">
          {/* Connecting lines - behind cards (z-0) */}
          <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-[#1e4db5]/30 dark:bg-[#60a5fa]/40 z-0" />

          {/* Steps Grid - above line (z-10) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="group relative bg-[#eff6ff] dark:bg-gray-800 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 border border-[#dbeafe] dark:border-gray-700"
                style={{ 
                  boxShadow: "0 4px 20px rgba(30, 77, 181, 0.08)"
                }}
              >
                {/* Step Number Badge */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center z-20">
                  <span className="text-white text-xs font-bold">{step.number}</span>
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-[#1e4db5] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#1e4db5]/30 relative z-20">
                  <FontAwesomeIcon 
                    icon={step.icon} 
                    className="text-2xl text-white" 
                  />
                </div>

                {/* Title */}
                <h3 
                  className="text-lg font-bold text-gray-900 dark:text-white mb-3 relative z-20"
                  style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p 
                  className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed relative z-20"
                  style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;