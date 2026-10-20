import React from "react";
import { Menu, Plus, School } from "lucide-react";
import LanguageToggle from "../common/LanguageToggle";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function DashboardHeader({ onOpenDrawer, onOpenAddClass }) {
  const { user } = useAuth();
  const { lang } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left Drawer Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDrawer}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-indigo-600" />
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Anant Classroom
            </h1>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />

          {/* Add / Join Class Button */}
          <button
            onClick={onOpenAddClass}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition active:scale-95"
            title={user?.role === "teacher" ? "Create Class" : "Join Class"}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">
              {user?.role === "teacher" 
                ? (lang === "hi" ? "क्लास बनाएं" : "Create Class") 
                : (lang === "hi" ? "जुड़ें" : "Join Class")}
            </span>
          </button>

          {/* Quick Profile Icon */}
          <img 
            src={user?.avatar} 
            alt={user?.name} 
            onClick={onOpenDrawer}
            className="w-8 h-8 rounded-full border border-indigo-200 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition"
          />
        </div>

      </div>
    </header>
  );
}