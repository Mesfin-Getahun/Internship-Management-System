
import React, { useState } from 'react';

const mockData = {
  'Faculty of Computing': {
    semester: 'Academic Year 2023/24 - Sem II',
    students: [
      { name: 'Abebe Bikila', id: 'BIT/102/13', org: 'EAL Group', mentorApproval: true, orgEval: true, result: 'Fulfilled' },
      { name: 'Eden Kebede', id: 'BIT/088/13', org: 'Hybrid Sys.', mentorApproval: true, orgEval: true, result: 'Fulfilled' },
      { name: 'Mulugeta Seraw', id: 'BIT/201/13', org: 'CBE', mentorApproval: true, orgEval: false, result: 'Pending' },
    ]
  },
  'Faculty of Electrical Eng.': {
    semester: 'Academic Year 2023/24 - Sem II',
    students: [
      { name: 'Hana Yohannes', id: 'EENG/301/13', org: 'Ethio Telecom', mentorApproval: true, orgEval: true, result: 'Fulfilled' },
      { name: 'Kebede Alemu', id: 'EENG/305/13', org: 'EEPCO', mentorApproval: false, orgEval: false, result: 'Pending' },
    ]
  },
  'Faculty of Civil Eng.': {
    semester: 'Academic Year 2023/24 - Sem II',
    students: [
      { name: 'Saba Tadesse', id: 'CENG/155/13', org: 'Safaricom', mentorApproval: true, orgEval: true, result: 'Fulfilled' },
    ]
  }
};

const FulfillmentReports = () => {
  const [selectedFaculty, setSelectedFaculty] = useState('Faculty of Computing');
  const [report, setReport] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGenerateReport = () => {
    setReport(mockData[selectedFaculty]);
  };

  const handleSend = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="animate-fade-in space-y-8">
      <header>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Fulfillment Reports</h2>
        <p className="text-slate-500 text-sm mt-1">Synthesize internship completion data for academic faculty confirmation.</p>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="flex flex-wrap gap-4 items-end">
           <div className="flex-grow max-w-xs">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Faculty Department</label>
              <select 
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {Object.keys(mockData).map(faculty => (
                  <option key={faculty} value={faculty}>{faculty}</option>
                ))}
              </select>
           </div>
           <div className="flex-grow max-w-xs">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Semester</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option>Academic Year 2023/24 - Sem II</option>
                <option>Academic Year 2023/24 - Sem I</option>
              </select>
           </div>
           <button 
             onClick={handleGenerateReport}
             className="px-8 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
           >
             Generate Fulfillment Report
           </button>
        </div>
      </div>

      {report && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-6">
           <div className="flex justify-between items-center px-4">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-widest">Report Preview: {selectedFaculty} - {report.semester}</h3>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-all">Export PDF</button>
                <button className="px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-all">Excel (CSV)</button>
                <button 
                  onClick={handleSend}
                  className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-700 transition-all shadow-lg"
                >
                  Send to Faculty Dean
                </button>
              </div>
           </div>

           <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                   <th className="p-5">Student Information</th>
                   <th className="p-5">Organization</th>
                   <th className="p-5 text-center">Mentor Appr.</th>
                   <th className="p-5 text-center">Org Eval</th>
                   <th className="p-5 text-right">Result</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 text-xs">
                 {report.students.map((row, i) => (
                   <tr key={i} className="hover:bg-slate-50/50">
                     <td className="p-5">
                       <div className="font-bold text-slate-800">{row.name}</div>
                       <div className="text-[10px] text-slate-400 font-mono mt-0.5">{row.id}</div>
                     </td>
                     <td className="p-5 text-slate-500 font-bold uppercase tracking-tighter">{row.org}</td>
                     <td className="p-5 text-center">
                       {row.mentorApproval ? <span className="text-green-500 font-black">✓</span> : <span className="text-slate-300">○</span>}
                     </td>
                     <td className="p-5 text-center">
                       {row.orgEval ? <span className="text-green-500 font-black">✓</span> : <span className="text-slate-300">○</span>}
                     </td>
                     <td className="p-5 text-right">
                        <span className={`px-2 py-1 rounded-lg font-black uppercase text-[9px] ${row.result === 'Fulfilled' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {row.result}
                        </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed bottom-10 right-10 animate-in slide-in-from-right-10 fade-in duration-300 bg-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[100] flex items-center gap-3">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-bold">✓</div>
          <p className="font-bold text-sm">Fulfillment report successfully forwarded to the Faculty Dean.</p>
        </div>
      )}
    </div>
  );
};

export default FulfillmentReports;
