import React, { useEffect, useState } from "react";
import heroImg1 from "../../assets/images/img1.png";
import heroImg2 from "../../assets/images/img2.png";
import heroImg3 from "../../assets/images/img3.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const stats = [
  { number: "500+", label: "Students" },
  { number: "150+", label: "Partner Organizations" },
  { number: "95%", label: "Success Rate" },
];

const images = [heroImg1, heroImg2, heroImg3];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % images.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const nextSlide = () => setCurrent((c) => (c + 1) % images.length);
  const prevSlide = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const goToSlide = (index) => setCurrent(index);

  return (
    <section
      id="home"
      className="relative w-full min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        {images.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              current === i ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={src}
              alt={`Slide ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <FontAwesomeIcon 
          icon={faChevronLeft} 
          className="text-white text-xl group-hover:scale-110 transition-transform" 
        />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-all duration-300 group"
        aria-label="Next slide"
      >
        <FontAwesomeIcon 
          icon={faChevronRight} 
          className="text-white text-xl group-hover:scale-110 transition-transform" 
        />
      </button>

      {/* Slide Indicators - All 3 always visible, current is BDU blue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${
              current === i 
                ? "bg-[#1e4db5] border-[#1e4db5] scale-125" 
                : "bg-white/30 border-white/50 hover:bg-white/60 hover:border-white/80"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-20">
        <div className="max-w-3xl space-y-6">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-2xl" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
            Connecting Students with{" "}
            <span className="text-[#3b82f6]">Real-World</span> Internship Opportunities
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed drop-shadow-lg" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
            A centralized platform for internship placement, monitoring, and performance tracking. 
            Start your career journey today.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="group flex items-center justify-center gap-2 px-8 py-4 bg-[#1e4db5] hover:bg-[#1a4199] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#1e4db5]/30 hover:-translate-y-1">
              Explore Opportunities
              <FontAwesomeIcon 
                icon={faArrowRight} 
                className="group-hover:translate-x-1 transition-transform" 
              />
            </button>
            <button className="px-8 py-4 border-2 border-white/80 text-white font-semibold rounded-xl hover:bg-[#1e4db5] hover:border-[#1e4db5] transition-all duration-300 backdrop-blur-sm">
              Login to Apply
            </button>
          </div>

          {/* Stats Grid - Each card has BDU blue shadow */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                style={{ 
                  boxShadow: "0 0 25px rgba(30, 77, 181, 0.25), 0 4px 20px rgba(0, 0, 0, 0.2)"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e4db5]/10 to-[#3b82f6]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <span className="block text-3xl md:text-4xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {stat.number}
                  </span>
                  <span className="text-sm md:text-base text-gray-300 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;