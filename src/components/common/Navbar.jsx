import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import { GraduationCap, ArrowRight } from "lucide-react";

export default function Navbar({ onLoginClick }) {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("brand")}
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />

          <button
            onClick={onLoginClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shadow-sm transition"
          >
            <span>{t("login")}</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}