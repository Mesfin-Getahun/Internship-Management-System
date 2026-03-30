import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheckCircle, faClock, faTimesCircle, faPaperPlane } from '@fortawesome/free-solid-svg-icons';;

const StatusTimeline = ({ statusHistory, currentStatus }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted': return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case 'Rejected': return <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />;
      case 'Under Review': return <FontAwesomeIcon icon={faClock} className="text-amber-500" />;
      case 'Applied': return <FontAwesomeIcon icon={faPaperPlane} className="text-blue-500" />;
      default: return <FontAwesomeIcon icon={faClock} className="text-slate-500" />;
    }
  };

  const isCompleted = (index) => {
    return index < statusHistory.findIndex(s => s.status === currentStatus);
  };

  return (
    <div className="space-y-4">
      {statusHistory.map((item, index) => (
        <div key={index} className="flex items-start">
          <div className="flex flex-col items-center mr-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.status === currentStatus ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-slate-100 dark:bg-slate-800'}`}>
              {getStatusIcon(item.status)}
            </div>
            {index < statusHistory.length - 1 && (
              <div className={`w-0.5 flex-grow ${isCompleted(index) ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
          </div>
          <div>
            <p className={`font-bold ${item.status === currentStatus ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{item.status}</p>
            <p className="text-sm text-slate-500">{item.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const ApplicationStatusModal = ({ application, onClose }) => {
  if (!application) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md m-4 border border-slate-200 dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{application.title}</h3>
            <p className="text-sm text-slate-500">{application.org}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FontAwesomeIcon icon={faTimes} size={20} />
          </button>
        </div>
        <div className="p-6">
          <h4 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-4">Status History</h4>
          <StatusTimeline statusHistory={application.statusHistory} currentStatus={application.status} />
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatusModal;
