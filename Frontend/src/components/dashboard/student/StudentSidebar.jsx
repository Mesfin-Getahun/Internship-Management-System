import React from 'react';
import { Link } from 'react-router-dom';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const StudentSidebar = ({
  activeTab,
  appState
}) => {
  const isAccepted = appState === 'ACCEPTED' || appState === 'PENDING_UIL' || appState === 'ACTIVATED' || appState === 'COMPLETED';
  const isActivated = appState === 'ACTIVATED' || appState === 'COMPLETED';
  const menuItems = [{
    id: 'overview',
    label: 'Dashboard Overview',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  }, {
    id: 'opportunities',
    label: 'Internship Opportunities',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745V6a2 2 0 012-2h14a2 2 0 012 2v7.255z'
  }, {
    id: 'my-applications',
    label: 'My Applications',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
  }, {
    id: 'process',
    label: 'Internship Process',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    disabled: !isAccepted
  }, {
    id: 'status',
    label: 'Internship Status',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    disabled: !isActivated
  }, {
    id: 'profile',
    label: 'Student Profile',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  }];
  return /*#__PURE__*/_jsxs("aside", {
    className: "h-screen w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col pt-20 transition-colors",
    children: [/*#__PURE__*/_jsx("div", {
      className: "px-6 py-4 border-b border-slate-800",
      children: /*#__PURE__*/_jsx("h2", {
        className: "text-white font-black text-[10px] uppercase tracking-[0.2em] opacity-50",
        children: "Student Ecosystem"
      })
    }), /*#__PURE__*/_jsx("nav", {
      className: "flex-grow px-4 mt-6 space-y-1 overflow-y-auto custom-scrollbar",
      children: menuItems.map(item => /*#__PURE__*/_jsxs(Link, {
        to: item.disabled ? '#' : `/dashboard/student/${item.id}`,
        onClick: e => item.disabled && e.preventDefault(),
        className: `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${item.disabled ? 'opacity-30 cursor-not-allowed' : activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`,
        children: [/*#__PURE__*/_jsx("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-5 w-5 shrink-0",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /*#__PURE__*/_jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: item.icon
          })
        }), /*#__PURE__*/_jsx("span", {
          className: "truncate",
          children: item.label
        })]
      }, item.id))
    }), /*#__PURE__*/_jsx("div", {
      className: "p-4 mt-auto border-t border-slate-800",
      children: /*#__PURE__*/_jsxs(Link, {
        to: "/",
        className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-400 hover:bg-red-950/20 transition-colors text-sm",
        children: [/*#__PURE__*/_jsx("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-5 w-5",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /*#__PURE__*/_jsx("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          })
        }), "Logout"]
      })
    })]
  });
};
export default StudentSidebar;
