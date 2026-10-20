import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { UserCheck, Tv2, Video, MessageSquareShare } from "lucide-react";

export default function HowItWorks() {
  const { lang } = useLanguage();

  const steps = [
    {
      icon: UserCheck,
      step: "01",
      titleEn: "Easy Role-Based Login",
      titleHi: "सरल रोल-आधारित लॉगिन",
      descEn: "Sign in with Google in one click as a Teacher or Student with zero setup friction.",
      descHi: "गूगल के ज़रिए एक क्लिक में शिक्षक या विद्यार्थी के रूप में तुरंत लॉगिन करें।",
    },
    {
      icon: Tv2,
      step: "02",
      titleEn: "Instant Stream Ingestion",
      titleHi: "यूट्यूब व ड्राइव इंटीग्रेशन",
      descEn: "Teachers paste an unlisted YouTube live link or pick recorded Drive lectures with zero hosting bills.",
      descHi: "शिक्षक अनलिस्टेड यूट्यूब लिंक या ड्राइव लेक्चर से बिना किसी सर्वर बिल के पढ़ाएं।",
    },
    {
      icon: Video,
      step: "03",
      titleEn: "Live Peer Video Grid",
      titleHi: "लाइव वेबकैम इंटरेक्शन",
      descEn: "Face-to-face peer webcam view with bulk mute/unmute host controls and live hand raise.",
      descHi: "होस्ट म्यूट/अनम्यूट कंट्रोल और हैंड रेज के साथ लाइव आमने-सामने क्लास लें।",
    },
    {
      icon: MessageSquareShare,
      step: "04",
      titleEn: "Persistent Study Hub",
      titleHi: "24/7 नोट्स और डिस्कशन",
      descEn: "Access previous notes, turn in assignments, and chat anytime across dedicated subject channels.",
      descHi: "विषयवार चैनल्स में कभी भी नोट्स डाउनलोड करें, असाइनमेंट भेजें और सवाल पूछें।",
    },
  ];

  return (
    <section className="w-full py-12 border-t border-gray-100 dark:border-gray-800">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {lang === "hi" ? "यह कैसे काम करता है?" : "How It Works"}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {lang === "hi"
            ? "चार आसान चरणों में आधुनिक वर्चुअल क्लासरूम का अनुभव लें"
            : "Four straightforward steps to a modern virtual classroom"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 flex flex-col justify-between shadow-sm hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-400 dark:text-gray-500">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  {lang === "hi" ? item.titleHi : item.titleEn}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {lang === "hi" ? item.descHi : item.descEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}