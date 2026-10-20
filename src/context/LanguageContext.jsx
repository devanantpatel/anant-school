import React, { createContext, useContext, useState } from "react";

const translations = {
  en: {
    brand: "Anant School",
    features: "Features",
    howItWorks: "How It Works",
    faq: "FAQ",
    login: "Sign In",
    getStarted: "Get Started Free",
    heroTitle: "A Smart, Free & Lightweight Virtual Classroom",
    heroSubtitle: "Experience seamless live learning with synchronized YouTube lectures, live peer video grids, and persistent study rooms.",
    createClass: "Teach on Anant School",
    joinClass: "Join as Student",
    coffeeSupport: "Support Developer",
  },
  hi: {
    brand: "अनंत स्कूल",
    features: "विशेषताएं",
    howItWorks: "यह कैसे काम करता है",
    faq: "अक्सर पूछे जाने वाले सवाल",
    login: "साइन इन करें",
    getStarted: "मुफ्त शुरुआत करें",
    heroTitle: "स्मार्ट, निशुल्क और हल्का वर्चुअल क्लासरूम",
    heroSubtitle: "यूट्यूब लाइव स्ट्रीम, वेबकैम वीडियो ग्रिड और 24/7 डिस्कशन रूम के साथ अपनी पढ़ाई को आसान बनाएं।",
    createClass: "क्लास शुरू करें",
    joinClass: "विद्यार्थी की तरह जुड़ें",
    coffeeSupport: "डेवलपर को सपोर्ट करें",
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("en");

  const toggleLanguage = () => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  };

  const t = (key) => {
    return translations[lang]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);