import React, { useState } from "react";
import { internshipData } from "../cards/Card.js";
import Card from "../cards/Card.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowRight, 
  faCompressAlt, 
  faExpandAlt,
  faCheckCircle,
  faBuilding 
} from "@fortawesome/free-solid-svg-icons";

const stats = [
  { number: "150+", label: "Partner Organizations" },
  { number: "500+", label: "Students Placed" },
  { number: "95%", label: "Satisfaction Rate" },
  { number: "24/7", label: "Platform Support" }
];

const benefits = [
  "Access to talented and motivated students",
  "Contribute to the next generation of professionals",
  "Flexible internship duration and requirements",
  "Easy-to-use platform for posting and managing positions"
];

const Opportunities = () => {
  const [showAll, setShowAll] = useState(false);
  const visibleOpportunities = showAll ? internshipData : internshipData.slice(0, 6);

  const handleToggleView = () => {
    setShowAll(!showAll);
    if (showAll) {
      document.getElementById('opportunities').scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Opportunities Section */}
      <section id="opportunities" className="relative w-full py-20 md:py-28 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4db5] to-transparent opacity-20" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
            >
              Available Internship Opportunities
            </h2>
            <div className="w-24 h-1 bg-[#1e4db5] mx-auto rounded-full mb-6" />
            <p 
              className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
            >
              Explore exciting opportunities from our partner organizations. Login to view full details and apply.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {visibleOpportunities.map((internship) => (
              <Card
                key={internship.id}
                title={internship.title}
                type={internship.type}
                company={internship.company}
                companyIcon={internship.companyIcon}
                description={internship.description}
                location={internship.location}
                locationIcon={internship.locationIcon}
                duration={internship.duration}
                durationIcon={internship.durationIcon}
                skills={internship.skills}
                applyLink={internship.applyLink}
              />
            ))}
          </div>

          {/* Toggle Button */}
          <div className="flex justify-center mb-8">
            {!showAll ? (
              <button 
                onClick={handleToggleView}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-[#dbeafe] dark:bg-[#1e3a8a]/30 text-[#1e4db5] dark:text-[#93c5fd] hover:bg-[#1e4db5] hover:text-white dark:hover:bg-[#3b82f6] dark:hover:text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-[#1e4db5]/30"
              >
                View All Opportunities
                <FontAwesomeIcon icon={faExpandAlt} className="group-hover:scale-110 transition-transform" />
              </button>
            ) : (
              <button 
                onClick={handleToggleView}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-[#1e4db5] dark:bg-[#3b82f6] text-white hover:bg-[#dbeafe] hover:text-[#1e4db5] dark:hover:bg-[#1e3a8a]/30 dark:hover:text-[#93c5fd] font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-[#1e4db5]/30 border-2 border-[#1e4db5] dark:border-[#3b82f6]"
              >
                <FontAwesomeIcon icon={faCompressAlt} className="group-hover:scale-90 transition-transform" />
                Show Less
              </button>
            )}
          </div>
        </div>
      </section>

      {/* For Organizations Section - Added after opportunities */}
      <section className="relative w-full py-20 md:py-28 bg-[#1e4db5] dark:bg-[#1e3a8a] overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <FontAwesomeIcon icon={faBuilding} className="text-white text-sm" />
                <span className="text-white text-sm font-medium">For Organizations</span>
              </div>

              {/* Heading */}
              <h2 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"
                style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
              >
                Want to Post an Internship Opportunity?
              </h2>

              {/* Description */}
              <p 
                className="text-lg text-blue-100 leading-relaxed"
                style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
              >
                Partner with Bahir Dar University and connect with talented students ready to make an impact in your organization.
              </p>

              {/* Benefits List */}
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3 text-white">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-[#93c5fd] flex-shrink-0" />
                    <span className="text-sm md:text-base" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* Register Button - Blue bg, lighter on hover */}
                  <button className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1e4db5] text-white hover:bg-[#3b82f6] font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-[#3b82f6]/30 border-2 border-[#1e4db5] hover:border-[#3b82f6]">
                    Register Your Organization
                    <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  {/* Learn More Button - Transparent with blue border, fills on hover */}
                  <button className="inline-flex items-center justify-center px-6 py-3 bg-transparent text-white border-2 border-[#60a5fa] hover:bg-[#1e4db5] hover:border-[#1e4db5] font-semibold rounded-lg transition-all duration-300">
                    Learn More
                  </button>
            </div>  
            </div>

            {/* Right Content - Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300"
                  style={{ boxShadow: "0 0 30px rgba(255, 255, 255, 0.1)" }}
                >
                  <span 
                    className="block text-3xl md:text-4xl font-bold text-white mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {stat.number}
                  </span>
                  <span className="text-sm text-blue-100" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Opportunities;