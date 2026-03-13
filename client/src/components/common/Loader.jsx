import React from "react";

const Loader = ({ className = "", isLoading = true, inline = false }) => {
  if (!isLoading) return null;

  if (inline) {
    return (
      <div className={`inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent ${className}`}></div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm ${className}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
    </div>
  );
};

export default Loader;
