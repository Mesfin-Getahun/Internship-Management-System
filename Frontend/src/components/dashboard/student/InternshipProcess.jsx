import React, { useState } from 'react';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const InternshipProcess = ({
  appState,
  onStateChange
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const steps = [{
    id: 1,
    title: 'Application Accepted',
    status: 'complete',
    icon: 'M9 12l2 2 4-4'
  }, {
    id: 2,
    title: 'Request Recommendation',
    status: appState === 'ACCEPTED' ? 'current' : 'complete',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5'
  }, {
    id: 3,
    title: 'UIL Approval',
    status: appState === 'PENDING_UIL' ? 'current' : appState === 'ACTIVATED' || appState === 'COMPLETED' ? 'complete' : 'pending',
    icon: 'M9 12l2 2 4-4'
  }, {
    id: 4,
    title: 'Internship Activated',
    status: appState === 'ACTIVATED' || appState === 'COMPLETED' ? 'complete' : 'pending',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z'
  }];
  const handleRequestRecommendation = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onStateChange('PENDING_UIL');
      setIsSubmitting(false);
    }, 1500);
  };
  return /*#__PURE__*/_jsxs("div", {
    className: "animate-fade-in space-y-8 max-w-4xl mx-auto pb-12",
    children: [/*#__PURE__*/_jsxs("header", {
      children: [/*#__PURE__*/_jsx("h2", {
        className: "text-2xl font-black text-slate-800 tracking-tight",
        children: "Internship Activation Process"
      }), /*#__PURE__*/_jsx("p", {
        className: "text-slate-500 text-sm mt-1 uppercase text-[10px] font-bold tracking-widest italic",
        children: "Workflow required to officially start your placement."
      })]
    }), /*#__PURE__*/_jsxs("div", {
      className: "bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "flex justify-between relative mb-12",
        children: [/*#__PURE__*/_jsx("div", {
          className: "absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 -z-0"
        }), steps.map(step => /*#__PURE__*/_jsxs("div", {
          className: "relative z-10 flex flex-col items-center gap-3",
          children: [/*#__PURE__*/_jsx("div", {
            className: `w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-white shadow-md transition-all duration-500 ${step.status === 'complete' ? 'bg-emerald-500 text-white' : step.status === 'current' ? 'bg-blue-600 text-white scale-110' : 'bg-slate-100 text-slate-300'}`,
            children: /*#__PURE__*/_jsx("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-6 w-6",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: /*#__PURE__*/_jsx("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "2.5",
                d: step.icon
              })
            })
          }), /*#__PURE__*/_jsx("span", {
            className: `text-[10px] font-black uppercase tracking-tighter text-center w-24 leading-tight ${step.status === 'current' ? 'text-blue-600' : 'text-slate-400'}`,
            children: step.title
          })]
        }, step.id))]
      }), /*#__PURE__*/_jsxs("div", {
        className: "pt-10 border-t border-slate-50 animate-fade-in",
        children: [appState === 'ACCEPTED' && /*#__PURE__*/_jsxs("div", {
          className: "space-y-8",
          children: [/*#__PURE__*/_jsxs("div", {
            className: "grid grid-cols-1 md:grid-cols-2 gap-6",
            children: [/*#__PURE__*/_jsxs("div", {
              className: "p-6 bg-slate-50 rounded-3xl border border-slate-100",
              children: [/*#__PURE__*/_jsx("p", {
                className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1",
                children: "Target Organization"
              }), /*#__PURE__*/_jsx("p", {
                className: "text-lg font-bold text-slate-800",
                children: "Safaricom Ethiopia"
              }), /*#__PURE__*/_jsx("p", {
                className: "text-xs text-blue-600 font-bold mt-1 uppercase",
                children: "Infrastructure & Cloud Dept."
              })]
            }), /*#__PURE__*/_jsxs("div", {
              className: "p-6 bg-slate-50 rounded-3xl border border-slate-100",
              children: [/*#__PURE__*/_jsx("p", {
                className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1",
                children: "Internship Title"
              }), /*#__PURE__*/_jsx("p", {
                className: "text-lg font-bold text-slate-800",
                children: "Cloud Operations Trainee"
              })]
            })]
          }), /*#__PURE__*/_jsxs("div", {
            className: "bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100",
            children: [/*#__PURE__*/_jsx("h4", {
              className: "font-bold text-indigo-900 mb-4",
              children: "Request Recommendation Letter"
            }), /*#__PURE__*/_jsx("p", {
              className: "text-indigo-700 text-xs leading-relaxed mb-6 font-medium",
              children: "By clicking below, you confirm that you have accepted the offer from the organization. The UIL office will review your academic eligibility and generate an official institutional recommendation letter."
            }), /*#__PURE__*/_jsxs("div", {
              className: "flex items-center gap-4",
              children: [/*#__PURE__*/_jsx("input", {
                type: "date",
                className: "px-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              }), /*#__PURE__*/_jsx("button", {
                onClick: handleRequestRecommendation,
                disabled: isSubmitting,
                className: "flex-grow py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2",
                children: isSubmitting ? /*#__PURE__*/_jsx("span", {
                  className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                }) : 'Request Recommendation from UIL'
              })]
            })]
          })]
        }), appState === 'PENDING_UIL' && /*#__PURE__*/_jsxs("div", {
          className: "flex flex-col items-center justify-center py-10 text-center space-y-6",
          children: [/*#__PURE__*/_jsx("div", {
            className: "w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center animate-pulse",
            children: /*#__PURE__*/_jsx("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-10 w-10",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: /*#__PURE__*/_jsx("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "2",
                d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              })
            })
          }), /*#__PURE__*/_jsxs("div", {
            children: [/*#__PURE__*/_jsx("h3", {
              className: "text-xl font-bold text-slate-800",
              children: "Request Sent to UIL Officer"
            }), /*#__PURE__*/_jsx("p", {
              className: "text-slate-500 text-sm mt-1 max-w-sm mx-auto font-medium leading-relaxed",
              children: "Your eligibility is currently being audited. Once approved, your internship will be officially activated on the platform."
            })]
          }), /*#__PURE__*/_jsxs("div", {
            className: "p-4 bg-slate-50 rounded-2xl border border-slate-100 w-full max-w-md flex justify-between items-center",
            children: [/*#__PURE__*/_jsx("span", {
              className: "text-[10px] font-black text-slate-400 uppercase tracking-widest",
              children: "Audit Progress"
            }), /*#__PURE__*/_jsx("span", {
              className: "text-xs font-bold text-amber-600",
              children: "Verification in Progress"
            })]
          })]
        }), appState === 'ACTIVATED' && /*#__PURE__*/_jsxs("div", {
          className: "flex flex-col items-center justify-center py-10 text-center space-y-6",
          children: [/*#__PURE__*/_jsx("div", {
            className: "w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center shadow-lg shadow-emerald-500/10 scale-110",
            children: /*#__PURE__*/_jsx("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-10 w-10",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: /*#__PURE__*/_jsx("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "2.5",
                d: "M5 13l4 4L19 7"
              })
            })
          }), /*#__PURE__*/_jsxs("div", {
            children: [/*#__PURE__*/_jsx("h3", {
              className: "text-2xl font-black text-slate-800 tracking-tight",
              children: "Internship Activated!"
            }), /*#__PURE__*/_jsx("p", {
              className: "text-slate-500 text-sm mt-1 max-w-sm mx-auto font-medium",
              children: "Your placement is now institutionalized. You can now access your Internship Status page to track attendance and supervisor notes."
            })]
          }), /*#__PURE__*/_jsx("button", {
            className: "px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95",
            children: "Go to Internship Status"
          })]
        })]
      })]
    })]
  });
};
export default InternshipProcess;