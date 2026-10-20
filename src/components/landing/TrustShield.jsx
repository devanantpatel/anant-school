import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { ShieldCheck, Lock, Award } from "lucide-react";

export default function TrustShield() {
  const { lang } = useLanguage();

  return (
    <section className="w-full my-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-indigo-600 text-white shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>{lang === "hi" ? "सत्यापित वातावरण और शून्य फेक डेटा" : "Verified Environment & Zero Fake Data"}</span>
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-xl">
              {lang === "hi"
                ? "केवल प्रमाणित शिक्षक और विद्यार्थी ही अध्ययन सामग्री पोस्ट कर सकते हैं। कोई स्पैम या अनधिकृत सामग्री प्लेटफॉर्म पर प्रदर्शित नहीं की जाती।"
                : "Only authenticated educators and enrolled students can create lectures or upload coursework. Clean and moderated learning spaces guaranteed."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 text-xs text-gray-600 dark:text-gray-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>{lang === "hi" ? "रोल प्रोटेक्टेड" : "Role Protected"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>{lang === "hi" ? "सत्यापित कक्षाएं" : "Verified Classes"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}