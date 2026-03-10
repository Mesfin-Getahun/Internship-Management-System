// import React, { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";

// const ApplicationPage = () => {
//   const { internship_id } = useParams();
//   const navigate = useNavigate();
//   const [cv, setCv] = useState(null);
//   const [letter, setLetter] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleFileChange = (e, setter) => {
//     setter(e.target.files[0]);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!cv || !letter) {
//       alert("Please upload both your CV and a recommendation letter.");
//       return;
//     }
//     setIsSubmitting(true);
//     // Simulate API call
//     setTimeout(() => {
//       console.log(
//         `Submitting application for internship ${internship_id} with files:`,
//         {
//           cv: cv.name,
//           letter: letter.name,
//         }
//       );
//       setIsSubmitting(false);
//       alert(
//         "Application submitted successfully! You will be redirected to your applications."
//       );
//       navigate("/student/my-applications");
//     }, 1500);
//   };

//   return (
//     <div className="animate-fade-in p-8 max-w-4xl mx-auto">
//       <header className="mb-8">
//         <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
//           Apply for Internship
//         </h2>
//         <p className="text-slate-500 text-sm mt-1">
//           Submit your documents for the selected opportunity.
//         </p>
//       </header>

//       <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//               Upload CV (PDF, DOCX)
//             </label>
//             <input
//               type="file"
//               accept=".pdf,.docx"
//               onChange={(e) => handleFileChange(e, setCv)}
//               className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//               required
//             />
//             {cv && (
//               <p className="text-xs text-slate-500 mt-2">Selected: {cv.name}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
//               Upload Recommendation Letter (PDF, DOCX)
//             </label>
//             <input
//               type="file"
//               accept=".pdf,.docx"
//               onChange={(e) => handleFileChange(e, setLetter)}
//               className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//               required
//             />
//             {letter && (
//               <p className="text-xs text-slate-500 mt-2">
//                 Selected: {letter.name}
//               </p>
//             )}
//           </div>

//           <div className="pt-4">
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:bg-slate-400 disabled:shadow-none"
//             >
//               {isSubmitting ? "Submitting..." : "Submit Application"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ApplicationPage;

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ApplicationPage = () => {
  const { internship_id } = useParams();
  const navigate = useNavigate();

  const [cv, setCv] = useState(null);
  const [academic_doc, setAcademic_doc] = useState(null);
  const [statement, setStatement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cv || !academic_doc) {
      alert("Please upload both your CV and a recommendation letter.");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      formData.append("cv", cv);
      formData.append("academic_doc", academic_doc);
      formData.append("statement", statement);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        `http://localhost:5000/api/student/applyInternship/${internship_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message);
      navigate("/student/my-applications");
    } catch (error) {
      console.log(error);
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Server error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
          Apply for Internship
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Submit your documents for the selected opportunity.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Statement */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Statement / Cover Letter
            </label>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              rows="4"
              className="w-full border rounded-xl p-3 text-sm"
              placeholder="Write why you are applying..."
              required
            />
          </div>

          {/* CV Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload CV (PDF, DOCX)
            </label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => handleFileChange(e, setCv)}
              required
            />
            {cv && (
              <p className="text-xs text-slate-500 mt-2">Selected: {cv.name}</p>
            )}
          </div>

          {/* Recommendation Letter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Recommendation Letter
            </label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => handleFileChange(e, setAcademic_doc)}
              required
            />
            {academic_doc && (
              <p className="text-xs text-slate-500 mt-2">
                Selected: {academic_doc.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplicationPage;
