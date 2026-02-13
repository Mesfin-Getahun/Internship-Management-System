
import React from 'react';

const StepProgressBar = ({ currentStep }) => {
  return (
    <div className="flex mt-8 gap-2 px-8">
      {[1, 2, 3].map(i => (
        <div 
          key={i} 
          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${currentStep >= i ? 'bg-white' : 'bg-blue-400 opacity-40'}`}
        ></div>
      ))}
    </div>
  );
};

export default StepProgressBar;
