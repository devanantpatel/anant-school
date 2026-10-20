import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function SpeechNarrator({ textToRead }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { lang } = useLanguage();

  const handleSpeech = () => {
    if (!("speechSynthesis" in window)) {
      alert("Browser speech support not available.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={handleSpeech}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
        isPlaying
          ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
          : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
      }`}
      title="Listen Instructions"
    >
      {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      <span>{isPlaying ? (lang === "hi" ? "रोकें" : "Stop Voice") : (lang === "hi" ? "सुनें" : "Listen Tour")}</span>
    </button>
  );
}