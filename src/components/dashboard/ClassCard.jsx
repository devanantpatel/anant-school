import React, { useState } from "react";
import { 
  Users, 
  ArrowUpRight, 
  Radio, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Lock, 
  Unlock, 
  Copy, 
  Check 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function ClassCard({ classroom, onEnterClass, onEditClass, onDeleteClass, onToggleLock }) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const isTeacher = user?.role === "teacher";

  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classroom.code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setMenuOpen(false);
    }, 1500);
  };

  return (
    <div className="group rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between relative">
      
      {/* Top Banner with dynamic gradient */}
      <div className={`p-5 relative ${classroom.color || "bg-gradient-to-r from-blue-600 to-indigo-700"} text-white`}>
        
        {/* Status Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {classroom.isLive && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white shadow animate-pulse">
              <Radio className="w-3 h-3" />
              LIVE
            </span>
          )}

          {classroom.isLocked && (
            <span className="p-1 rounded-full bg-black/40 text-amber-300" title="Classroom is Locked">
              <Lock className="w-3.5 h-3.5" />
            </span>
          )}

          {/* Teacher 3-Dots Action Menu */}
          {isTeacher && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-1.5 z-30 text-xs font-semibold animate-fadeIn"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEditClass(classroom);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{lang === "hi" ? "एडिट करें" : "Edit Details"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onToggleLock(classroom);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    {classroom.isLocked ? (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{lang === "hi" ? "अनलॉक करें" : "Unlock Class"}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{lang === "hi" ? "लॉक करें" : "Lock Class"}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopyCode}
                    className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-blue-500" />}
                    <span>{copied ? "Copied!" : (lang === "hi" ? "कोड कॉपी करें" : "Copy Code")}</span>
                  </button>

                  <div className="h-[1px] bg-gray-100 dark:bg-gray-800 my-1" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDeleteClass(classroom.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === "hi" ? "डिलीट करें" : "Delete Class"}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold truncate pr-16">{classroom.title}</h3>
        <p className="text-xs text-white/80 mt-1 truncate">
          {classroom.section ? `${classroom.section} • ` : ""}{classroom.subject}
        </p>
        <span className="text-[10px] text-white/70 font-mono mt-3 inline-block bg-black/20 px-2 py-0.5 rounded">
          Code: {classroom.code}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2 mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {classroom.description || "Active interactive learning environment."}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>{classroom.studentsCount || 0} students enrolled</span>
          </div>
        </div>

        {/* Enter Classroom Action */}
        <button
          onClick={() => onEnterClass(classroom)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 hover:bg-indigo-50 dark:bg-gray-700 dark:hover:bg-indigo-950/40 text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 text-xs font-semibold transition active:scale-95"
        >
          <span>{lang === "hi" ? "क्लास में जाएं" : "Open Classroom"}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}