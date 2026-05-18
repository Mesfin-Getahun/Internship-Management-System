import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

const DashboardMenuButton = ({ onClick, label = "Open dashboard menu" }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="inline-flex lg:hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
  >
    <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
  </button>
);

export default DashboardMenuButton;
