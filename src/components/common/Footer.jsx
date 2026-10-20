import React from "react";
import { Coffee, Code2, Heart } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function Footer({ onOpenCoffee }) {
  const { lang } = useLanguage();

  return (
    <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-500 dark:text-gray-400">
        
        {/* Brand & Dev Info */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-bold text-sm">
            <span>Anant School</span>
            <span className="text-gray-400 font-normal">| Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
            <span className="text-gray-400 font-normal">by Developer</span>
          </div>
          <p className="flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Open, Modular, & Zero-Cost EdTech Platform</span>
          </p>
        </div>

        {/* Coffee / Support Button */}
        <div>
          <button
            onClick={onOpenCoffee}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-medium border border-amber-200/80 dark:border-amber-700/60 transition active:scale-95 shadow-sm"
          >
            <Coffee className="w-4 h-4 fill-amber-500 text-amber-600" />
            <span>{lang === "hi" ? "डेवलपर को कॉफी ऑफर करें (UPI)" : "Buy Developer a Coffee (UPI)"}</span>
          </button>
        </div>

        {/* Legal & Copyright */}
        <div className="flex flex-col items-center md:items-end gap-1">
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
            <a href="#terms" className="hover:underline">
              {lang === "hi" ? "नियम व शर्तें" : "Terms"}
            </a>
            <a href="#privacy" className="hover:underline">
              {lang === "hi" ? "गोपनीयता नीति" : "Privacy Policy"}
            </a>
          </div>
          <p>© 2026 Anant School. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}