
import React from 'react';
import { useAuth } from '../../../AuthContext';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const StudentNavbar = () => {
  const {
    user,
    logout
  } = useAuth();
  return /*#__PURE__*/_jsxs("nav", {
    className: "fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 px-8 flex items-center justify-between transition-colors",
    children: [/*#__PURE__*/_jsxs("div", {
      className: "flex items-center gap-4",
      children: [/*#__PURE__*/_jsx("div", {
        className: "w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20",
        children: /*#__PURE__*/_jsxs("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-6 w-6",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: [/*#__PURE__*/_jsx("path", {
            d: "M12 14l9-5-9-5-9 5 9 5z"
          }), /*#__PURE__*/_jsx("path", {
            d: "M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
          })]
        })
      }), /*#__PURE__*/_jsxs("div", {
        className: "flex flex-col",
        children: [/*#__PURE__*/_jsx("span", {
          className: "font-extrabold text-xl tracking-tight text-slate-800 dark:text-white leading-none uppercase",
          children: "BiT Student Portal"
        }), /*#__PURE__*/_jsxs("div", {
          className: "flex items-center gap-2 mt-1",
          children: [/*#__PURE__*/_jsxs("span", {
            className: "px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-black rounded uppercase tracking-wider",
            children: ["Role: ", user?.role || 'Student']
          }), /*#__PURE__*/_jsx("span", {
            className: "w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"
          }), /*#__PURE__*/_jsx("span", {
            className: "text-slate-400 text-[10px] font-bold uppercase tracking-widest",
            children: "BIT Bahir Dar"
          })]
        })]
      })]
    }), /*#__PURE__*/_jsxs("div", {
      className: "flex items-center gap-4",
      children: [/*#__PURE__*/_jsx("button", {
        onClick: logout,
        className: "px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors uppercase tracking-widest",
        children: "Logout"
      }), /*#__PURE__*/_jsxs("button", {
        className: "relative p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group",
        children: [/*#__PURE__*/_jsx("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-6 w-6",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /*#__PURE__*/_jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          })
        }), /*#__PURE__*/_jsx("span", {
          className: "absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 group-hover:scale-125 transition-transform"
        })]
      }), /*#__PURE__*/_jsx("div", {
        className: "h-10 w-px bg-slate-200 dark:bg-slate-800 mx-2"
      }), /*#__PURE__*/_jsxs("div", {
        className: "flex items-center gap-3 pl-2",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "text-right hidden sm:block",
          children: [/*#__PURE__*/_jsx("p", {
            className: "text-sm font-bold text-slate-800 dark:text-white leading-none",
            children: user?.name || 'Abebe Bikila'
          }), /*#__PURE__*/_jsx("p", {
            className: "text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-wider",
            children: user?.username || 'BIT/102/13'
          })]
        }), /*#__PURE__*/_jsx("div", {
          className: "w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-blue-500/20 overflow-hidden shadow-md group cursor-pointer hover:border-blue-500 transition-colors",
          children: /*#__PURE__*/_jsx("img", {
            src: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Abebe Bikila')}&background=2563EB&color=fff`,
            alt: "User Avatar",
            className: "w-full h-full object-cover"
          })
        })]
      })]
    })]
  });
};
export default StudentNavbar;
