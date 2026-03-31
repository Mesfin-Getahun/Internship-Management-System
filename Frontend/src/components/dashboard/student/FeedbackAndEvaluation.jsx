import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBuilding, faStar, faSpinner, faCommentSlash } from '@fortawesome/free-solid-svg-icons';

const FeedbackCard = ({ author, role, date, content, rating }) => (
  <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 mb-6 shadow-sm transition-all hover:shadow-lg group">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-slate-700 flex items-center justify-center mr-4 border border-indigo-100">
          {role?.toLowerCase().includes('faculty') ? (
            <FontAwesomeIcon icon={faUser} className="w-6 h-6 text-indigo-500" />
          ) : (
            <FontAwesomeIcon icon={faBuilding} className="w-6 h-6 text-indigo-500" />
          )}
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white text-lg">{author || 'Supervisor'}</h4>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mt-1">{role || 'Mentor Evaluation'}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{date ? new Date(date).toLocaleDateString() : 'Recent'}</p>
        {rating && (
          <div className="flex items-center justify-end mt-2 gap-1">
            {[...Array(5)].map((_, i) => (
              <FontAwesomeIcon icon={faStar}
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">{content}</p>
  </div>
);

const FeedbackAndEvaluation = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/viewFeedbacks`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        
        if (res.data.feedbacks) {
           setFeedbacks(res.data.feedbacks);
        } else if (Array.isArray(res.data)) {
           setFeedbacks(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchFeedback();
  }, [user]);

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Feedback & Evaluations</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Review official academic and performance feedback from your assigned supervisors.
        </p>
      </header>

      {loading ? (
         <div className="flex justify-center items-center h-64 text-indigo-500">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
         </div>
      ) : feedbacks.length > 0 ? (
        <div className="space-y-6">
           {feedbacks.map((fb, index) => (
             <FeedbackCard 
                key={index} 
                author={fb.mentor_name || fb.company_name || fb.author}
                role={fb.role || (fb.university_mentor_id ? 'Faculty Mentor' : 'Organization Supervisor')}
                date={fb.created_at || fb.date}
                content={fb.comments || fb.feedback_text || fb.content}
                rating={fb.score || fb.rating}
             />
           ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center p-12 h-64 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <FontAwesomeIcon icon={faCommentSlash} size="3x" className="text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-white">No Feedback Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-md text-center">
            Evaluations and performance reviews will appear here once submitted by your university or company supervisors.
          </p>
        </div>
      )}
    </div>
  );
};

export default FeedbackAndEvaluation;
