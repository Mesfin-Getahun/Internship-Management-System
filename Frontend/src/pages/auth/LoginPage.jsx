
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthHeader from '../../components/auth/AuthHeader.jsx';
import LoginForm from '../../components/auth/LoginForm.jsx';

const LoginPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalizedRole = role?.toLowerCase();
    
    if (normalizedRole === 'organization') {
      navigate('/dashboard/organization');
    } else if (normalizedRole === 'faculty') {
      navigate('/dashboard/faculty');
    } else if (normalizedRole === 'mentor') {
      navigate('/dashboard/mentor');
    } else if (normalizedRole === 'student') {
      navigate('/dashboard/student');
    } else {
      console.log(`Authenticating ${role}...`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-blue-100 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all">
        <AuthHeader />
        <LoginForm 
          role={role}
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          onSubmit={handleSubmit}
          onBackToRoles={() => navigate('/')}
          onRegisterOrg={() => navigate('/register/organization')}
        />
      </div>
      <button 
        onClick={() => navigate('/')} 
        className="mt-8 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex items-center text-sm font-bold transition-colors group"
      >
        <span className="group-hover:-translate-x-1 transition-transform mr-2">&larr;</span> 
        Back to Role Selection
      </button>
    </div>
  );
};

export default LoginPage;
