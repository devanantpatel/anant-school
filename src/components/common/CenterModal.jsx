import React from "react";
import { AlertCircle, CheckCircle2, HelpCircle, X } from "lucide-react";

export default function CenterModal({
  isOpen,
  type = "confirm", // 'confirm' | 'danger' | 'info' | 'success'
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertCircle className="w-7 h-7 text-red-500" />;
      case "success":
        return <CheckCircle2 className="w-7 h-7 text-emerald-500" />;
      case "info":
        return <AlertCircle className="w-7 h-7 text-indigo-500" />;
      default:
        return <HelpCircle className="w-7 h-7 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700/80 p-6 flex flex-col items-center text-center relative transform transition-all duration-200 scale-100"
      >
        {/* Close cross top right */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Center Icon */}
        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 mb-3.5 flex items-center justify-center">
          {getIcon()}
        </div>

        {/* Title & Message */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs transition active:scale-95"
            >
              {cancelText}
            </button>
          )}

          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-xs text-white shadow-md active:scale-95 transition ${
              type === "danger"
                ? "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}