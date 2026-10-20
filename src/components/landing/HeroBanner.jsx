import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import SpeechNarrator from "../common/SpeechNarrator";
import { Video, Users, Sparkles, BookOpen } from "lucide-react";

export default function HeroBanner({ onTeacherClick, onStudentClick }) {
  const { t, lang } = useLanguage();

  const speechIntro = lang === "hi"
    ? "अनंत स्कूल में आपका स्वागत है। यहाँ शिक्षक यूट्यूब वीडियो और लाइव स्ट्रीम के ज़रिए सीधे पढ़ा सकते हैं, और विद्यार्थी बिना किसी झंझट के कक्षा से जुड़ सकते हैं।"
    : "Welcome to Anant School. A lightweight virtual learning environment where educators present synchronized lectures and students learn interactively.";

  return (
    <section className="w-full py-10 sm:py-16 flex flex-col items-center text-center">
      {/* Voice Assistant Pill */}
      <div className="mb-6 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Sparkles className="w-3 h-3" />
          100% Free & Open
        </span>
        <SpeechNarrator textToRead={speechIntro} />
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl leading-tight">
        {t("heroTitle")}
      </h1>

      {/* Subtitle */}
      <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl px-2">
        {t("heroSubtitle")}
      </p>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto px-4">
        <button
          onClick={onTeacherClick}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition"
        >
          <Video className="w-4 h-4" />
          <span>{t("createClass")}</span>
        </button>

        <button
          onClick={onStudentClick}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-sm shadow-sm active:scale-95 transition"
        >
          <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>{t("joinClass")}</span>
        </button>
      </div>

      {/* Feature Highlights Mini Pills */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left max-w-xl w-full px-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-100/70 dark:bg-gray-800/60">
          <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Zero Bandwidth Bills</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-100/70 dark:bg-gray-800/60">
          <Video className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Sync YouTube Lectures</span>
        </div>
        <div className="col-span-2 sm:col-span-1 flex items-center gap-2 p-2.5 rounded-lg bg-gray-100/70 dark:bg-gray-800/60">
          <Users className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Face-to-Face Classrooms</span>
        </div>
      </div>
    </section>
  );
}