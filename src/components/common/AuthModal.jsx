import React, { useState } from "react";
import { X, GraduationCap, School, User, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function AuthModal({ isOpen, onClose, initialRole = "student" }) {
  const { login } = useAuth();
  const { lang } = useLanguage();
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    login({
      id: "usr_" + Date.now(),
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, "")}@school.local`,
      role: role,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl mb-2">
            <School className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {lang === "hi" ? "अनंत स्कूल में प्रवेश करें" : "Enter Anant School"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {lang === "hi" ? "अपनी भूमिका चुनें और अध्ययन शुरू करें" : "Select your role to access your personalized classroom"}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-700/60 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
              role === "student"
                ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            <span>{lang === "hi" ? "विद्यार्थी (Student)" : "Student"}</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("teacher")}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
              role === "teacher"
                ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{lang === "hi" ? "शिक्षक (Teacher)" : "Teacher"}</span>
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {lang === "hi" ? "आपका पूरा नाम" : "Full Name"}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anant Patel"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {lang === "hi" ? "ईमेल पता (वैकल्पिक)" : "Email Address (Optional)"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md active:scale-95 transition"
          >
            <span>{lang === "hi" ? "डैशबोर्ड खोलें" : "Proceed to Workspace"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}