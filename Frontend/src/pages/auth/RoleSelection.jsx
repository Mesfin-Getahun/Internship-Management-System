
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRoles } from '../../../constants';
import RoleCard from '../../components/auth/RoleCard';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/login/${role.toLowerCase().replace(' ', '-')}`);
  };

  const roles = [
    {
      role: UserRoles.STUDENT,
      description: 'Access internship opportunities and manage applications',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      )
    },
    {
      role: UserRoles.MENTOR,
      description: 'Guide students and monitor internship progress',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      role: UserRoles.FACULTY,
      description: 'Coordinate student internships and academic requirements',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      role: UserRoles.ORGANIZATION,
      description: 'Post internship opportunities and manage applications',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 sm:p-12 animate-fade-in transition-colors duration-300">
      <div className="max-w-6xl w-full">
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-600 dark:bg-blue-700 text-white shadow-2xl mb-8 transform hover:rotate-3 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-800 dark:text-white mb-4 tracking-tight">
            University Internship System
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            Welcome to Bahir Dar Institute of Technology. Select your specialized portal below.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {roles.map((item) => (
            <RoleCard
              key={item.role}
              role={item.role}
              description={item.description}
              icon={item.icon}
              onClick={handleRoleSelect}
            />
          ))}
        </section>

        <section className="flex flex-col items-center gap-8 relative">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"></div>
          <p className="text-slate-400 dark:text-slate-500 text-xs uppercase font-bold tracking-widest bg-slate-50 dark:bg-slate-950 px-6 -mt-10 z-10 transition-colors">
            Administrative Access Only
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button 
              onClick={() => navigate('/restricted/uil-officer')}
              className="px-8 py-4 bg-slate-800 dark:bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-950 dark:hover:bg-black transition-all flex items-center shadow-xl hover:-translate-y-1"
            >
              UIL Officer Portal &rarr;
            </button>
            <button 
              onClick={() => navigate('/restricted/system-admin')}
              className="px-8 py-4 bg-slate-800 dark:bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-950 dark:hover:bg-black transition-all flex items-center shadow-xl hover:-translate-y-1"
            >
              System Administrator &rarr;
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RoleSelection;
