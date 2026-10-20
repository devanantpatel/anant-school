import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      title="Switch Language"
    >
      <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
      <span>{lang === "en" ? "हिन्दी" : "English"}</span>
    </button>
  );
}