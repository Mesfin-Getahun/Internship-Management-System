
import React, { useState } from 'react';

const InternshipOpportunities = () => {
  const [selectedInternship, setSelectedInternship] = useState(null);
  
  const opportunities = [
    { id: 1, title: 'Junior Software Developer', org: 'Safaricom Ethiopia', loc: 'Addis Ababa', deadline: 'Oct 30, 2023', desc: 'Join our mobile money team to help build the next generation of financial services.', skills: 'React, Node.js, REST APIs', duration: '3 Months', applied: false },
    { id: 2, title: 'Network Engineering Intern', org: 'Ethio Telecom', loc: 'Bahir Dar', deadline: 'Nov 05, 2023', desc: 'Support the regional infrastructure team in maintaining core 4G/5G networks.', skills: 'Cisco, TCP/IP, Linux', duration: '4 Months', applied: true },
    { id: 3, title: 'Full-stack Web Intern', org: 'Commercial Bank of Ethiopia', loc: 'Addis Ababa', deadline: 'Oct 28, 2023', desc: 'Help modernize internal portals using cutting-edge web technologies.', skills: 'Java, Spring, Angular', duration: '3 Months', applied: false },
    { id: 4, title: 'Cloud Systems Assistant', org: 'Hybrid Systems', loc: 'Remote', deadline: 'Oct 25, 2023', desc: 'Work with our AWS team to automate infrastructure deployment pipelines.', skills: 'AWS, Docker, Python', duration: '3 Months', applied: false },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Internship Opportunities</h2>
          <p className="text-slate-500 text-sm mt-1">Discover and apply for curated roles matching your BIT curriculum.</p>
        </div>
        <div className="w-full sm:w-auto flex gap-3">
          <div className="relative flex-grow sm:flex-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search roles..." className="w-full sm:w-64 pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {opportunities.map((opp) => (
          <div key={opp.id} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-black">
                {opp.org.charAt(0)}
              </div>
              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                opp.applied ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {opp.applied ? 'Applied' : 'New'}
              </span>
            </div>
            
            <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">{opp.title}</h4>
            <p className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">{opp.org}</p>
            
            <div className="flex gap-4 mb-8">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {opp.loc}
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Deadline: {opp.deadline}
              </div>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 mb-8 flex-grow">
              {opp.desc}
            </p>

            <button 
              onClick={() => setSelectedInternship(opp)}
              className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all active:scale-[0.98]"
            >
              View Details & Apply
            </button>
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full -mr-12 -mt-12"></div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {selectedInternship && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedInternship(null)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex gap-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black shadow-xl shadow-blue-600/20">
                  {selectedInternship.org.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">{selectedInternship.title}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-bold text-sm uppercase mt-1">{selectedInternship.org}</p>
                </div>
              </div>
              <button onClick={() => setSelectedInternship(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8 flex-grow">
              <section>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">About the Role</h5>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{selectedInternship.desc}</p>
              </section>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Required Skills</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedInternship.skills}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Duration</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedInternship.duration}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Location</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedInternship.loc}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Positions</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">5 Total</p>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
               {selectedInternship.applied ? (
                 <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-2xl flex items-center gap-4">
                   <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center font-bold">!</div>
                   <p className="text-amber-800 dark:text-amber-400 text-sm font-bold italic">You have already applied for this internship.</p>
                 </div>
               ) : (
                 <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                   Apply for this Position
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipOpportunities;
