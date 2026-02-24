import React from 'react';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const InternshipStatus = ({
  appState
}) => {
  if (appState !== 'ACTIVATED' && appState !== 'COMPLETED') return null;
  const attendance = {
    present: 28,
    absent: 2,
    totalWeeks: 6,
    score: 6
  }; // absences = 2 -> score 6%

  return /*#__PURE__*/_jsxs("div", {
    className: "animate-fade-in space-y-8 pb-12",
    children: [/*#__PURE__*/_jsxs("header", {
      children: [/*#__PURE__*/_jsx("h2", {
        className: "text-2xl font-black text-slate-800 tracking-tight",
        children: "Active Internship Status"
      }), /*#__PURE__*/_jsx("p", {
        className: "text-slate-500 text-sm mt-1 uppercase text-[10px] font-bold tracking-widest italic",
        children: "Institutional Monitoring of Active Placement."
      })]
    }), /*#__PURE__*/_jsxs("div", {
      className: "grid grid-cols-1 lg:grid-cols-3 gap-8",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "lg:col-span-2 space-y-8",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "bg-white rounded-[2rem] border border-slate-100 shadow-sm p-10 flex flex-col md:flex-row gap-10",
          children: [/*#__PURE__*/_jsx("div", {
            className: "w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-3xl flex items-center justify-center shrink-0 border border-blue-100",
            children: /*#__PURE__*/_jsx("div", {
              className: "text-4xl font-black text-blue-600",
              children: "S"
            })
          }), /*#__PURE__*/_jsxs("div", {
            className: "flex-grow space-y-6",
            children: [/*#__PURE__*/_jsxs("div", {
              children: [/*#__PURE__*/_jsx("h3", {
                className: "text-2xl font-black text-slate-800 leading-tight",
                children: "Cloud Infrastructure Intern"
              }), /*#__PURE__*/_jsx("p", {
                className: "text-blue-600 font-black uppercase text-xs tracking-widest mt-1",
                children: "Safaricom Ethiopia PLC"
              })]
            }), /*#__PURE__*/_jsxs("div", {
              className: "grid grid-cols-2 gap-8",
              children: [/*#__PURE__*/_jsxs("div", {
                children: [/*#__PURE__*/_jsx("p", {
                  className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1",
                  children: "Company Supervisor"
                }), /*#__PURE__*/_jsx("p", {
                  className: "text-sm font-bold text-slate-700 leading-none",
                  children: "Eng. Solomon Tadesse"
                }), /*#__PURE__*/_jsx("p", {
                  className: "text-[10px] text-slate-400 mt-1 uppercase font-bold",
                  children: "Infrastructure Lead"
                })]
              }), /*#__PURE__*/_jsxs("div", {
                children: [/*#__PURE__*/_jsx("p", {
                  className: "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1",
                  children: "Assigned Mentor"
                }), /*#__PURE__*/_jsx("p", {
                  className: "text-sm font-bold text-slate-700 leading-none",
                  children: "Dr. Samuel Ketema"
                }), /*#__PURE__*/_jsx("p", {
                  className: "text-[10px] text-slate-400 mt-1 uppercase font-bold",
                  children: "Faculty of Computing"
                })]
              })]
            }), /*#__PURE__*/_jsxs("div", {
              className: "pt-4 flex gap-3",
              children: [/*#__PURE__*/_jsx("span", {
                className: "px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase",
                children: "Active"
              }), /*#__PURE__*/_jsx("span", {
                className: "px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase",
                children: "Week 06 / 15"
              })]
            })]
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden",
          children: [/*#__PURE__*/_jsxs("div", {
            className: "p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center",
            children: [/*#__PURE__*/_jsx("h4", {
              className: "font-bold text-slate-800 uppercase text-xs tracking-widest",
              children: "Supervisor Bi-Weekly Notes"
            }), /*#__PURE__*/_jsx("p", {
              className: "text-[10px] text-slate-400 font-bold uppercase italic italic",
              children: "Read-only Log"
            })]
          }), /*#__PURE__*/_jsx("div", {
            className: "divide-y divide-slate-50",
            children: [{
              range: 'Week 1-2',
              date: 'Oct 15, 2023',
              preview: 'Initial onboarding and platform architecture review. Student demonstrated quick learning.'
            }, {
              range: 'Week 3-4',
              date: 'Oct 29, 2023',
              preview: 'Assisted in deploying Docker containers to the development cluster. Good technical grasp.'
            }].map((note, i) => /*#__PURE__*/_jsxs("div", {
              className: "p-6 hover:bg-slate-50 transition-colors",
              children: [/*#__PURE__*/_jsxs("div", {
                className: "flex justify-between items-start mb-2",
                children: [/*#__PURE__*/_jsx("span", {
                  className: "text-sm font-black text-slate-800",
                  children: note.range
                }), /*#__PURE__*/_jsx("span", {
                  className: "text-[10px] font-bold text-slate-400",
                  children: note.date
                })]
              }), /*#__PURE__*/_jsx("p", {
                className: "text-xs text-slate-500 leading-relaxed font-medium",
                children: note.preview
              }), /*#__PURE__*/_jsx("button", {
                className: "mt-4 text-blue-600 text-[10px] font-black uppercase hover:underline tracking-widest",
                children: "View Full Technical Report"
              })]
            }, i))
          })]
        })]
      }), /*#__PURE__*/_jsxs("div", {
        className: "space-y-8",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "bg-slate-900 rounded-[2rem] p-10 text-white relative overflow-hidden",
          children: [/*#__PURE__*/_jsx("h4", {
            className: "text-indigo-400 font-black uppercase text-[10px] tracking-widest mb-6 border-b border-white/10 pb-4",
            children: "Attendance Audit"
          }), /*#__PURE__*/_jsxs("div", {
            className: "space-y-8",
            children: [/*#__PURE__*/_jsxs("div", {
              className: "flex justify-between items-end",
              children: [/*#__PURE__*/_jsxs("div", {
                children: [/*#__PURE__*/_jsx("p", {
                  className: "text-4xl font-black text-white",
                  children: attendance.present
                }), /*#__PURE__*/_jsx("p", {
                  className: "text-[10px] font-bold text-slate-500 uppercase",
                  children: "Days Present"
                })]
              }), /*#__PURE__*/_jsxs("div", {
                className: "text-right",
                children: [/*#__PURE__*/_jsx("p", {
                  className: "text-xl font-bold text-red-400",
                  children: attendance.absent
                }), /*#__PURE__*/_jsx("p", {
                  className: "text-[10px] font-bold text-slate-500 uppercase",
                  children: "Absences"
                })]
              })]
            }), /*#__PURE__*/_jsxs("div", {
              className: "space-y-3",
              children: [/*#__PURE__*/_jsxs("div", {
                className: "flex justify-between text-[10px] font-black uppercase tracking-widest",
                children: [/*#__PURE__*/_jsx("span", {
                  className: "text-slate-500",
                  children: "Current Score"
                }), /*#__PURE__*/_jsxs("span", {
                  className: "text-emerald-400",
                  children: [attendance.score, "% / 10%"]
                })]
              }), /*#__PURE__*/_jsx("div", {
                className: "h-2 w-full bg-slate-800 rounded-full overflow-hidden",
                children: /*#__PURE__*/_jsx("div", {
                  className: "h-full bg-emerald-500",
                  style: {
                    width: `${attendance.score / 10 * 100}%`
                  }
                })
              })]
            })]
          })]
        }), appState === 'COMPLETED' ? /*#__PURE__*/_jsxs("div", {
          className: "bg-white rounded-3xl border-4 border-indigo-100 p-8 shadow-xl",
          children: [/*#__PURE__*/_jsx("h4", {
            className: "font-black text-slate-800 uppercase text-xs tracking-widest mb-6 text-center",
            children: "Company Evaluation Result"
          }), /*#__PURE__*/_jsx("div", {
            className: "space-y-4 mb-8",
            children: [{
              l: 'General',
              s: '8.5 / 10'
            }, {
              l: 'Personal',
              s: '9.0 / 10'
            }, {
              l: 'Professional',
              s: '18.0 / 20'
            }, {
              l: 'Attendance',
              s: '10.0 / 10'
            }].map((row, i) => /*#__PURE__*/_jsxs("div", {
              className: "flex justify-between items-center text-xs font-bold border-b border-slate-50 pb-2",
              children: [/*#__PURE__*/_jsx("span", {
                className: "text-slate-400 uppercase tracking-tighter",
                children: row.l
              }), /*#__PURE__*/_jsx("span", {
                className: "text-slate-800",
                children: row.s
              })]
            }, i))
          }), /*#__PURE__*/_jsxs("div", {
            className: "text-center bg-indigo-600 p-6 rounded-2xl text-white shadow-lg",
            children: [/*#__PURE__*/_jsx("p", {
              className: "text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-1",
              children: "Total Institutional Grade"
            }), /*#__PURE__*/_jsxs("p", {
              className: "text-4xl font-black",
              children: ["45.5 ", /*#__PURE__*/_jsx("span", {
                className: "text-sm opacity-40",
                children: "/ 50"
              })]
            })]
          })]
        }) : /*#__PURE__*/_jsxs("div", {
          className: "bg-slate-50 rounded-3xl p-8 border border-slate-100 text-center",
          children: [/*#__PURE__*/_jsx("div", {
            className: "w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm",
            children: /*#__PURE__*/_jsx("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-6 w-6 text-slate-300",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: /*#__PURE__*/_jsx("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "2",
                d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              })
            })
          }), /*#__PURE__*/_jsx("p", {
            className: "text-xs font-bold text-slate-400 uppercase tracking-widest",
            children: "Final Evaluation Locked"
          }), /*#__PURE__*/_jsx("p", {
            className: "text-[10px] text-slate-400 mt-1 italic",
            children: "Unlockable only after 15 weeks of fulfillment."
          })]
        })]
      })]
    })]
  });
};
export default InternshipStatus;