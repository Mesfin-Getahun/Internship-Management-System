import React, { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faRightToBracket } from "@fortawesome/free-solid-svg-icons";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Benefit", href: "#benefits" },
  { name: "Opportunity", href: "#opportunities" },
  { name: "Contact", href: "#footer" }
];

const Header = () => {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => link.href.replace("#", ""));
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between py-4">
        {/* Left: Logo */}
        <div className="flex items-center space-x-2">
          <img src="../src/assets/images/logo.png" alt="BDU" className="w-10 h-10" />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-xl text-gray-900 dark:text-white">BDU Internship</span>
            <span className="text-sm text-gray-600 dark:text-gray-300">Placement System</span>
          </div>
        </div>

        {/* Middle: Nav Links */}
        <nav className="hidden md:flex space-x-6">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace("#", "");
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                className={`relative text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-[#1e4db5] font-bold"
                    : "text-gray-800 dark:text-gray-200 hover:text-[#1e4db5]"
                }`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {link.name}
                {/* Underline for active */}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-[#1e4db5] transition-all duration-300 ${
                    isActive ? "w-full" : "w-0"
                  }`}
                />
              </a>
            );
          })}
        </nav>

        {/* Right: Login / Register + Theme Toggle */}
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-[#1e4db5] text-white hover:bg-[#1a4199] transition-colors text-sm font-medium">
            <FontAwesomeIcon icon={faRightToBracket} className="text-sm" />
            <span>Login</span>
          </button>
          <button className="flex items-center space-x-1 px-4 py-2 rounded-lg border-2 border-[#1e4db5] text-[#1e4db5] hover:bg-[#1e4db5] hover:text-white transition-all text-sm font-medium">
            <FontAwesomeIcon icon={faUser} className="text-sm" />
            <span>Register</span>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;