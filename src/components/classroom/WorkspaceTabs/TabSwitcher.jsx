import React from "react";
import { MessageSquare, FolderGit2, MessagesSquare, History } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";

export default function TabSwitcher({ activeTab, onTabChange }) {
  const { lang } = useLanguage();

  const tabs = [
    { id: "live-qna", labelEn: "Live Q&A", labelHi: "लाइव सवाल", icon: MessageSquare },
    { id: "lectures", labelEn: "Previous Lectures", labelHi: "पुराने लेक्चर", icon: History },
    { id: "classwork", labelEn: "Notes & Tasks", labelHi: "नोट्स व कार्य", icon: FolderGit2 },
    { id: "community", labelEn: "Discussion Hub", labelHi: "चर्चा मंच", icon: MessagesSquare },
  ];

  return (
    <div className="w-full flex items-center border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-t-2xl px-2 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition ${
              isActive
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{lang === "hi" ? tab.labelHi : tab.labelEn}</span>
          </button>
        );
      })}
    </div>
  );
}