import React from "react";
import { X, Heart, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function CoffeeModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const upiId = "7607765685@upi"; // Apni UPI ID yahan configure kar sakte ho
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}&pn=AnantSchoolDev&cu=INR`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full mb-3">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Support Anant School
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
            Free server aur maintenance support ke liye koi bhi small contribution scan karein.
          </p>

          {/* QR Code Container */}
          <div className="p-3 bg-white rounded-xl shadow-inner border border-gray-200 mb-4">
            <img src={qrUrl} alt="UPI QR Code" className="w-40 h-40 object-contain" />
          </div>

          {/* UPI Copy Button */}
          <div className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-xs font-mono">
            <span className="truncate text-gray-700 dark:text-gray-200">{upiId}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-sans font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}