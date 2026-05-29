import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const PasswordInput = ({ value, onChange, className = "", ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentValue, setCurrentValue] = useState(value || "");
  const isControlled = value !== undefined;
  const hasValue = String(isControlled ? value : currentValue).length > 0;

  useEffect(() => {
    if (isControlled) {
      setCurrentValue(value || "");
    }
  }, [isControlled, value]);

  const handleChange = (event) => {
    if (!isControlled) {
      setCurrentValue(event.target.value);
    }
    onChange?.(event);
  };

  return (
    <div className="relative">
      <input
        {...props}
        {...(isControlled ? { value } : {})}
        onChange={handleChange}
        type={isVisible ? "text" : "password"}
        className={`${className} pr-12`}
      />
      {hasValue && (
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
          aria-label={isVisible ? "Hide password" : "Show password"}
          title={isVisible ? "Hide password" : "Show password"}
        >
          <FontAwesomeIcon icon={isVisible ? faEyeSlash : faEye} className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default PasswordInput;
