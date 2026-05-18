import React from "react";

const DashboardSidebarOverlay = ({ isOpen, onClose }) => (
  <button
    type="button"
    aria-label="Close dashboard menu"
    onClick={onClose}
    className={`fixed inset-0 z-[60] bg-slate-950/55 backdrop-blur-sm transition-opacity lg:hidden ${
      isOpen ? "opacity-100" : "pointer-events-none opacity-0"
    }`}
  />
);

export default DashboardSidebarOverlay;
