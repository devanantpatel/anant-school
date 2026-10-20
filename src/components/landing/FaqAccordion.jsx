import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { ChevronDown } from "lucide-react";

export default function FaqAccordion() {
  const { lang } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      qEn: "Is Anant School completely free to use?",
      qHi: "क्या अनंत स्कूल का उपयोग पूरी तरह निशुल्क है?",
      aEn: "Yes, Anant School leverages smart streaming and modern serverless storage architecture to remain 100% free for teachers and learners.",
      aHi: "हाँ, अनंत स्कूल स्मार्ट स्ट्रीमिंग और आधुनिक स्टोरेज आर्किटेक्चर का उपयोग करता है ताकि शिक्षकों और छात्रों के लिए यह पूरी तरह मुफ्त रहे।",
    },
    {
      qEn: "How does YouTube live streaming work inside the app?",
      qHi: "ऐप के अंदर यूट्यूब लाइव स्ट्रीमिंग कैसे काम करती है?",
      aEn: "Teachers simply paste their unlisted YouTube live stream URL or recorded video link. The player syncs automatically inside the classroom banner with zero hosting latency.",
      aHi: "शिक्षक बस अपना अनलिस्टेड यूट्यूब लाइव स्ट्रीम या वीडियो लिंक पेस्ट करते हैं। वीडियो क्लासरूम के टॉप बैनर में बिना किसी लैग के सिंक्रनाइज़ हो जाता है।",
    },
    {
      qEn: "Where are notes, submissions, and attachments stored?",
      qHi: "नोट्स, असाइनमेंट और अटैचमेंट्स कहाँ सुरक्षित रहते हैं?",
      aEn: "Materials are uploaded via decentralized bot storage pipelines and Google Drive links, ensuring fast and continuous access without file size bottlenecks.",
      aHi: "अध्ययन सामग्री सुरक्षित बॉट स्टोरेज पाइपलाइन और गूगल ड्राइव लिंक के माध्यम से स्टोर होती है, जिससे फ़ाइल साइज की कोई सीमा नहीं रहती।",
    },
    {
      qEn: "Can students access previous recordings and discussion chats?",
      qHi: "क्या छात्र पुरानी रिकॉर्डिंग और चैट डिस्कशन बाद में देख सकते हैं?",
      aEn: "Yes, every class has dedicated tabs for previous video recordings, lecture notes, and persistent 24/7 topic channels.",
      aHi: "हाँ, प्रत्येक क्लास में पुरानी रिकॉर्डिंग, नोट्स और 24/7 चलने वाले डिस्कशन चैनल्स के लिए अलग टैब उपलब्ध हैं।",
    },
  ];

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="w-full py-12 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {lang === "hi" ? "अक्सर पूछे जाने वाले सवाल" : "Frequently Asked Questions"}
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-800/60 transition"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-medium text-sm text-gray-900 dark:text-white focus:outline-none"
              >
                <span>{lang === "hi" ? faq.qHi : faq.qEn}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-indigo-600" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800/80 pt-3">
                  {lang === "hi" ? faq.aHi : faq.aEn}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}