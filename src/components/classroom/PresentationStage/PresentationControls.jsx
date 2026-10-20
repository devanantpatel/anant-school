import React, { useState } from "react";
import { Link2, Radio, Play, Check } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function PresentationControls({ currentUrl, onUpdateStreamUrl, isLive, onToggleLiveStatus }) {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const [inputUrl, setInputUrl] = useState(currentUrl || "");
  const [saved, setSaved] = useState(false);

  // Sirf teacher ko setup input dikhayenge
  if (!isTeacher) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    onUpdateStreamUrl(inputUrl.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mt-3">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Link2 className="w-4 h-4" />
          </div>
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste YouTube Live or Recorded URL (e.g. https://youtu.be/...)"
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="submit"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{saved ? "Loaded" : "Cast to Stage"}</span>
          </button>

          <button
            type="button"
            onClick={onToggleLiveStatus}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
              isLive
                ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:border-red-800"
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 border-transparent"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLive ? "text-red-500 animate-pulse" : ""}`} />
            <span>{isLive ? "End Stream" : "Mark Live"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}