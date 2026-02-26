import React from 'react';

const DocumentUploadStep = ({ formData, updateFormData, errors }) => {
  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (file) updateFormData({ [field]: file.name });
  };

  const FileUploadField = ({ label, field, required = false }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all text-center ${formData[field] ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-blue-900 bg-slate-50'}`}>
        <input
          type="file"
          onChange={e => handleFileChange(field, e)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf,.doc,.docx"
        />
        <div className="flex flex-col items-center">
          {formData[field] ? (
            <>
              <div className="text-green-500 mb-2" style={{ fontSize: 28 }}>✅</div>
              <p className="text-sm font-semibold text-green-700">{formData[field]}</p>
              <p className="text-xs text-green-600 mt-1">File uploaded successfully</p>
            </>
          ) : (
            <>
              <div className="text-slate-400 mb-2" style={{ fontSize: 28 }}>⬆️</div>
              <p className="text-sm font-medium text-slate-600">Drag & drop or click to upload</p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX up to 10MB</p>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FileUploadField label="Business License (Optional)" field="licenseFile" />
        <div className="md:col-span-2">
          <FileUploadField label="Company Profile (Optional)" field="profileFile" />
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center mt-1">
            <input
              type="checkbox"
              checked={formData.agreed}
              onChange={e => updateFormData({ agreed: e.target.checked })}
              className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 transition-all checked:bg-blue-900 checked:border-blue-900"
            />
            <div className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none p-0.5" />
          </div>
          <span className="text-sm text-slate-600 select-none group-hover:text-slate-900 transition-colors">I confirm that the information provided is accurate and I agree to comply with university internship regulations.</span>
        </label>
        {errors.agreed && <p className="mt-2 text-xs text-red-500 font-medium">{errors.agreed}</p>}
      </div>
    </div>
  );
};

export default DocumentUploadStep;
