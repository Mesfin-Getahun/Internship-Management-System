import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faGraduationCap, 
  faMapMarkerAlt, 
  faEnvelope, 
  faPhone,
  faHome,
  faInfoCircle,
  faBriefcase,
  faStar,
  faSignInAlt,
  faBuilding,
  faUserPlus,
  faQuestionCircle
} from "@fortawesome/free-solid-svg-icons";

const quickLinks = [
  { name: "Home", href: "#home", icon: faHome },
  { name: "About Internships", href: "#about", icon: faInfoCircle },
  { name: "Opportunities", href: "#opportunities", icon: faBriefcase },
  { name: "Benefits", href: "#benefits", icon: faStar }
];

const userLinks = [
  { name: "Student Login", href: "#login", icon: faSignInAlt },
  { name: "Organization Login", href: "#org-login", icon: faBuilding },
  { name: "Register", href: "#register", icon: faUserPlus },
  { name: "Help Center", href: "#help", icon: faQuestionCircle }
];

const contactInfo = [
  {
    icon: faMapMarkerAlt,
    text: ["Bahir Dar Institute of Technology", "Bahir Dar, Ethiopia"]
  },
  {
    icon: faEnvelope,
    text: ["internships@bdu.edu.et"]
  },
  {
    icon: faPhone,
    text: ["+251 58 123 4567"]
  }
];

const Footer = () => {
  return (
    <footer 
    id="footer"
    className="relative w-full bg-[#0f172a] dark:bg-[#020617] text-white overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#1e4db5] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1e4db5] flex items-center justify-center">
                <FontAwesomeIcon icon={faGraduationCap} className="text-xl text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  BDU Internship
                </h3>
                <p className="text-xs text-gray-400">Placement System</p>
              </div>
            </div>
            <p 
              className="text-gray-400 text-sm leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Empowering students through meaningful internship experiences and connecting them with industry leaders.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 
              className="text-lg font-semibold mb-6 text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="group flex items-center gap-2 text-gray-400 hover:text-[#60a5fa] transition-colors duration-300 text-sm"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <span className="w-1 h-1 rounded-full bg-[#1e4db5] group-hover:w-2 transition-all duration-300" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h4 
              className="text-lg font-semibold mb-6 text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              For Users
            </h4>
            <ul className="space-y-3">
              {userLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="group flex items-center gap-2 text-gray-400 hover:text-[#60a5fa] transition-colors duration-300 text-sm"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <span className="w-1 h-1 rounded-full bg-[#1e4db5] group-hover:w-2 transition-all duration-300" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 
              className="text-lg font-semibold mb-6 text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Contact Us
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((info, index) => (
                <li key={index} className="flex items-start gap-3">
                  <FontAwesomeIcon 
                    icon={info.icon} 
                    className="text-[#60a5fa] mt-1 flex-shrink-0 text-sm" 
                  />
                  <div className="text-gray-400 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {info.text.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
              © 2026 BDU Internship Placement System. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#privacy" className="text-gray-500 hover:text-[#60a5fa] text-sm transition-colors">Privacy Policy</a>
              <a href="#terms" className="text-gray-500 hover:text-[#60a5fa] text-sm transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;