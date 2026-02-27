import React from 'react';
import { User, Building, Star } from 'lucide-react';

const FeedbackCard = ({ author, role, date, content, rating }) => (
  <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-6 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mr-4">
          {role === 'Faculty Mentor' ? (
            <User className="w-6 h-6 text-slate-500" />
          ) : (
            <Building className="w-6 h-6 text-slate-500" />
          )}
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white">{author}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">{role}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{date}</p>
        {rating && (
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                fill="currentColor"
              />
            ))}
          </div>
        )}
      </div>
    </div>
    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{content}</p>
  </div>
);

const FeedbackAndEvaluation = () => {
  // Mock data - this will be replaced with data from an API call
  const feedbacks = [
    {
      author: 'Dr. Eleanor Vance',
      role: 'Faculty Mentor',
      date: 'Feb 20, 2026',
      content: 'The student has shown excellent progress in their preliminary reports. Their research skills are commendable, but they need to focus on improving their time management to meet deadlines more consistently. Overall, a very promising start.',
      rating: 4,
    },
    {
      author: 'Mr. Johnathan Doe',
      role: 'Organization Supervisor',
      date: 'Feb 15, 2026',
      content: 'During the initial project briefing, the student was attentive, asked insightful questions, and demonstrated a solid foundational knowledge of our tech stack. We are looking forward to seeing their contributions to the project.',
      rating: 5,
    },
     {
      author: 'Dr. Eleanor Vance',
      role: 'Faculty Mentor',
      date: 'Jan 30, 2026',
      content: 'The initial internship plan submitted was well-structured and ambitious. I have approved the plan and provided some minor suggestions for the first month\'s objectives.',
      rating: 5,
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Feedback & Evaluations</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Feedback from your mentors and supervisors will appear here.
        </p>
      </div>

      {feedbacks.length > 0 ? (
        feedbacks.map((feedback, index) => <FeedbackCard key={index} {...feedback} />)
      ) : (
        <div className="text-center p-12 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-white">No Feedback Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Once your mentors or supervisors provide feedback, it will be displayed on this page.
          </p>
        </div>
      )}
    </div>
  );
};

export default FeedbackAndEvaluation;
