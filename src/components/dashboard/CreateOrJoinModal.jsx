import React, { useState } from "react";
import { X, Plus, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function CreateOrJoinModal({ isOpen, onClose, onCreateClass, onJoinClass }) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const isTeacher = user?.role === "teacher";

  // Teacher fields
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  // Student field
  const [joinCode, setJoinCode] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isTeacher) {
      if (!title.trim()) return;
      onCreateClass({
        id: "cls_" + Date.now(),
        title: title.trim(),
        subject: subject.trim() || "General",
        description: description.trim(),
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        studentsCount: 1,
        isLive: false,
        color: "bg-gradient-to-r from-indigo-600 to-purple-600",
      });
    } else {
      if (!joinCode.trim()) return;
      onJoinClass(joinCode.trim().toUpperCase());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {isTeacher 
            ? (lang === "hi" ? "नई कक्षा बनाएं" : "Create New Class") 
            : (lang === "hi" ? "कक्षा में जुड़ें" : "Join a Class")}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          {isTeacher
            ? "Provide subject details to generate a unique classroom link & code."
            : "Enter the 6-character code provided by your educator."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isTeacher ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics - Grade 10"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Subject / Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Geometry & Algebra"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Class Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="e.g. 7X9K2P"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-center tracking-widest font-mono text-base uppercase rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md active:scale-95 transition"
          >
            {isTeacher ? <Plus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{isTeacher ? "Create Classroom" : "Join Classroom"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}