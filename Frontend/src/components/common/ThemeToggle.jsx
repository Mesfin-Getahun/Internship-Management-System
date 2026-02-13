
import React from 'react';

const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  // If props are not passed correctly, fallback to reading the document root
  const isDark = typeof isDarkMode === 'boolean'
    ? isDarkMode
    : (typeof window !== 'undefined' && document.documentElement.classList.contains('dark')) || false;

  const handleClick = () => {
    // Prefer the parent-provided handler if available.
    if (typeof toggleTheme === 'function') {
      console.debug('ThemeToggle: calling toggleTheme prop');
      toggleTheme();
    }

    // Also ensure the document root reflects the toggled state immediately so styles change
    // even if the parent doesn't update the `dark` class synchronously.
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      try {
        if (isDark) {
          root.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        } else {
          root.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        }
      } catch (e) {
        // ignore storage errors
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed top-6 right-6 z-50 p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-110 active:scale-95 transition-all duration-300 group"
      aria-label="Toggle Theme"
      aria-pressed={isDark}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400 group-hover:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707ZM12 7a5 5 0 100 10 5 5 0 000-10z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700 group-hover:-rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
