import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faFilePdf } from '@fortawesome/free-solid-svg-icons';

const OrgProfile = () => {
  return (
    <div className="animate-fade-in space-y-8 max-w-4xl mx-auto pb-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Organization Profile</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your account information and institutional verification.</p>
        </div>
        <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-200 dark:border-green-800/30">
          Verified Partner
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">General Information</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Organization Name</label>
                  <input type="text" value="Ethiopian Airlines Group" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Registration Number</label>
                  <input type="text" value="EAL-REG-9812" readOnly className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Industry Type</label>
                  <input type="text" value="Aviation & Transportation" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Contact</label>
                  <input type="text" value="Tewodros Kassahun" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Official Email</label>
                  <input type="email" value="hr@ethiopianairlines.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <button className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                Update Profile
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Security Settings</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                  <input type="password" placeholder="Min 8 characters" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                  <input type="password" placeholder="Repeat password" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <button className="mt-4 px-8 py-3 bg-slate-800 dark:bg-slate-950 text-white rounded-xl font-bold hover:bg-slate-900 dark:hover:bg-black transition-all">
                Change Password
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600 text-white rounded-3xl p-8 shadow-xl shadow-blue-600/20 relative overflow-hidden">
             <div className="relative z-10">
               <h4 className="text-xl font-bold mb-2">Partner Badge</h4>
               <p className="text-blue-100 text-xs leading-relaxed mb-6">Your organization is an active industry partner of BIT, facilitating 12+ internships this year.</p>
               <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <FontAwesomeIcon icon={faCheckCircle} className="h-10 w-10 text-white" />
               </div>
             </div>
             <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
             <h4 className="font-bold text-slate-800 dark:text-white mb-4">Official Documents</h4>
             <div className="space-y-3">
               <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-3">
                   <FontAwesomeIcon icon={faFilePdf} className="h-5 w-5 text-red-500" />
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Business_License.pdf</span>
                 </div>
                 <button className="text-blue-600 font-bold text-[10px] uppercase">View</button>
               </div>
               <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-3">
                   <FontAwesomeIcon icon={faFilePdf} className="h-5 w-5 text-blue-500" />
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400">MoU_BIT_2023.pdf</span>
                 </div>
                 <button className="text-blue-600 font-bold text-[10px] uppercase">View</button>
               </div>
             </div>
             <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 rounded-xl text-xs font-bold hover:border-blue-400 hover:text-blue-500 transition-colors">
               + Upload New Document
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgProfile;
