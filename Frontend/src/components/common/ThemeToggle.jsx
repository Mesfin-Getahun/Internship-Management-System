import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 p-3 rounded-2xl 
      bg-white dark:bg-slate-800 
      shadow-xl border border-slate-200 dark:border-slate-700 
      hover:scale-110 active:scale-95 
      transition-all duration-300 group"
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <FontAwesomeIcon icon={faSun} className="h-6 w-6 text-amber-400 group-hover:rotate-45 transition-transform" />
      ) : (
        <FontAwesomeIcon icon={faMoon} className="h-6 w-6 text-slate-700 group-hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
};

export default ThemeToggle;