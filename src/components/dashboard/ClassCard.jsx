import React from "react";
import { Video, Users, ArrowUpRight, Radio } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function ClassCard({ classroom, onEnterClass }) {
  const { lang } = useLanguage();

  return (
    <div className="group rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
      
      {/* Top Banner with dynamic gradient */}
      <div className={`p-5 relative ${classroom.color || "bg-gradient-to-r from-blue-600 to-indigo-700"} text-white`}>
        {classroom.isLive && (
          <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white shadow animate-pulse">
            <Radio className="w-3 h-3" />
            LIVE
          </span>
        )}
        <h3 className="text-lg font-bold truncate pr-14">{classroom.title}</h3>
        <p className="text-xs text-white/80 mt-1 truncate">{classroom.section || classroom.subject}</p>
        <span className="text-[10px] text-white/60 font-mono mt-3 inline-block">
          Code: {classroom.code}
        </span>
      </div>

      {/* Card Content & Stats */}
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

        {/* Enter Classroom CTA */}
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