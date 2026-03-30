import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faBuilding, faClock, faUsers, faEdit } from '@fortawesome/free-solid-svg-icons';;

const facultyData = {
  name: 'Dr. Almaz Abebe',
  title: 'Department Head & Senior Lecturer',
  department: 'Software Engineering',
  email: 'almaz.abebe@bdu.edu.et',
  phone: '+251 91 234 5678',
  office: 'Building 7, Room 304',
  officeHours: 'Mon, Wed, Fri: 10:00 AM - 12:00 PM',
  mentoringLoad: 8,
  publications: 23,
  yearsOfService: 12,
  avatarUrl: 'https://ui-avatars.com/api/?name=Almaz+Abebe&background=0284c7&color=fff&size=128',
  bio: 'Dr. Almaz Abebe is a passionate educator and researcher in the field of Software Engineering, with a focus on distributed systems and machine learning applications. With over a decade of experience at Bahir Dar University, she is dedicated to fostering the next generation of tech leaders and innovators.'
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
      <Icon className="text-slate-500 dark:text-slate-400" size={20} />
    </div>
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">{label}</p>
      <p className="text-sm font-medium text-slate-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const StatCard = ({ value, label }) => (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-center">
        <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{value}</p>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">{label}</p>
    </div>
);


const FacultyProfile = () => {
  return (
    <div className="animate-fade-in space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Faculty Profile</h2>
          <p className="text-slate-500 text-sm mt-1">Your personal and professional information.</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
          <FontAwesomeIcon icon={faEdit} size={16} />
          faEdit Profile
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-8">
          <div className="flex flex-col sm:flex-row items-start gap-8">
            <img 
              src={facultyData.avatarUrl} 
              alt="Faculty Avatar"
              className="w-32 h-32 rounded-full border-4 border-slate-200 dark:border-slate-700 shadow-md"
            />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{facultyData.name}</h3>
              <p className="text-md font-semibold text-emerald-600 dark:text-emerald-400">{facultyData.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{facultyData.department}</p>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{facultyData.bio}</p>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Contact & Office Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem icon={faEnvelope} label="Email Address" value={facultyData.email} />
              <InfoItem icon={faPhone} label="Phone Number" value={facultyData.phone} />
              <InfoItem icon={faBuilding} label="Office Location" value={facultyData.office} />
              <InfoItem icon={faClock} label="Office Hours" value={facultyData.officeHours} />
            </div>
          </div>
        </div>

        {/* Right Column: Stats */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Statistics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                    <StatCard value={facultyData.mentoringLoad} label="Students Mentored" />
                    <StatCard value={facultyData.publications} label="Publications" />
                    <StatCard value={facultyData.yearsOfService} label="Years of Service" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;
