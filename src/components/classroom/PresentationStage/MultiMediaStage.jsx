import React, { useState } from "react";
import { ChevronUp, ChevronDown, Radio, AlertCircle, PenTool, Layout } from "lucide-react";
import WhiteboardCanvas from "./WhiteboardCanvas";
import InAppPdfViewer from "./InAppPdfViewer";
import { useAuth } from "../../../context/AuthContext";

export default function MultiMediaStage({ 
  mode, 
  contentUrl, 
  noticeText,
  isLive, 
  isCollapsed, 
  onToggleCollapse 
}) {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const [isPenActive, setIsPenActive] = useState(false);

  const getEmbedUrl = (url) => {
    if (!url) return "https://www.youtube.com/embed/L_LUpnjgPso?autoplay=1&mute=1&playsinline=1";
    let videoId = "";
    if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1]?.split("?")[0];
    else if (url.includes("watch?v=")) videoId = url.split("watch?v=")[1]?.split("&")[0];
    else if (url.includes("live/")) videoId = url.split("live/")[1]?.split("?")[0];
    else if (url.length === 11) videoId = url;

    const id = videoId || "L_LUpnjgPso";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&enablejsapi=1&origin=${origin}`;
  };

  return (
    <div className="w-full bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-xl transition-all relative">
      {/* Stage Header */}
      <div className="bg-gray-900 px-3 sm:px-4 py-2 flex items-center justify-between text-xs border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-400 font-semibold uppercase text-[10px]">
            {mode} Mode
          </span>
          {isLive && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
              <Radio className="w-2.5 h-2.5" /> LIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isTeacher && !isCollapsed && (
            <button
              onClick={() => setIsPenActive(!isPenActive)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                isPenActive
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-800 text-gray-300 hover:text-white"
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{isPenActive ? "Pen On" : "Pen"}</span>
            </button>
          )}

          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition"
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            <span>{isCollapsed ? "Show" : "Hide"}</span>
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      {!isCollapsed && (
        <div className="relative w-full aspect-video bg-gray-950 flex items-center justify-center overflow-hidden">
          <WhiteboardCanvas
            isActive={isPenActive}
            onClose={() => setIsPenActive(false)}
          />

          {mode === "youtube" && (
            <iframe
              src={getEmbedUrl(contentUrl)}
              title="Class Lecture"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          )}

          {mode === "whiteboard" && (
            <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-4 select-none">
              <div className="text-center text-gray-500 text-xs">
                <Layout className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-60" />
                <span className="font-semibold text-gray-300">Live Whiteboard Canvas</span>
                <p className="text-[11px] mt-0.5">Top bar se "Pen" active karke padhana shuru karein.</p>
              </div>
            </div>
          )}

          {mode === "localVideo" && contentUrl && (
            <video
              src={contentUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          )}

          {/* In-App Touch Scrollable PDF */}
          {mode === "pdf" && contentUrl && (
            <InAppPdfViewer pdfUrl={contentUrl} />
          )}

          {mode === "image" && contentUrl && (
            <img
              src={contentUrl}
              alt="Class Diagram"
              className="max-h-full max-w-full object-contain p-2"
            />
          )}

          {mode === "notice" && (
            <div className="p-8 text-center max-w-xl">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Class Announcement</h3>
              <p className="text-base text-gray-300 leading-relaxed bg-gray-900/80 p-4 rounded-xl border border-gray-800">
                {noticeText || "No announcement posted."}
              </p>
            </div>
          )}
        </div>
      )}

      {isCollapsed && (
        <div className="p-2 text-center text-xs text-gray-400 bg-gray-950">
          📺 Presentation is minimized.
        </div>
      )}
    </div>
  );
}