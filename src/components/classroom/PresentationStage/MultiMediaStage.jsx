import React, { useState, useRef, useEffect } from "react";
import { 
  ChevronUp, 
  ChevronDown, 
  Radio, 
  AlertCircle, 
  PenTool, 
  Layout, 
  FileText, 
  ExternalLink 
} from "lucide-react";
import WhiteboardCanvas from "./WhiteboardCanvas";
import { useAuth } from "../../../context/AuthContext";

export default function MultiMediaStage({ 
  mode = "youtube", 
  contentUrl = "https://www.youtube.com/watch?v=jfKfPfyJRdk", 
  noticeText = "", 
  isLive = false, 
  isCollapsed = false, 
  onToggleCollapse,
  roomChannel 
}) {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const [isPenActive, setIsPenActive] = useState(false);
  const videoPlayerRef = useRef(null);

  // Safe Mode fallback
  const activeMode = mode || "youtube";
  const activeUrl = contentUrl || "https://www.youtube.com/watch?v=jfKfPfyJRdk";

  // Real-time Video Sync for Local Videos
  useEffect(() => {
    if (!roomChannel) return;

    const handleVideoSync = ({ payload }) => {
      const vid = videoPlayerRef.current;
      if (!vid || isTeacher) return;

      if (Math.abs(vid.currentTime - payload.currentTime) > 1.2) {
        vid.currentTime = payload.currentTime;
      }
      if (payload.action === "play" && vid.paused) {
        vid.play().catch(() => {});
      } else if (payload.action === "pause" && !vid.paused) {
        vid.pause();
      }
    };

    roomChannel.on("broadcast", { event: "media_video_sync" }, handleVideoSync);
  }, [roomChannel, isTeacher]);

  const emitVideoControl = (action) => {
    if (!isTeacher || !roomChannel || !videoPlayerRef.current) return;
    roomChannel.send({
      type: "broadcast",
      event: "media_video_sync",
      payload: {
        action,
        currentTime: videoPlayerRef.current.currentTime,
      },
    });
  };

  const getEmbedUrl = (url) => {
    if (!url) return "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&playsinline=1";
    let videoId = "";
    if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1]?.split("?")[0];
    else if (url.includes("watch?v=")) videoId = url.split("watch?v=")[1]?.split("&")[0];
    else if (url.includes("live/")) videoId = url.split("live/")[1]?.split("?")[0];
    else if (url.length === 11) videoId = url;

    const id = videoId || "jfKfPfyJRdk";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&enablejsapi=1&origin=${origin}`;
  };

  return (
    <div className="w-full bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl transition-all relative">
      {/* 1. Stage Top Header */}
      <div className="bg-gray-900 px-3 sm:px-4 py-2.5 flex items-center justify-between text-xs border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-indigo-600/30 text-indigo-400 font-bold uppercase text-[10px] tracking-wider">
            {activeMode} Mode
          </span>
          {isLive && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
              <Radio className="w-2.5 h-2.5" /> LIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Pen Button for Teacher */}
          {isTeacher && !isCollapsed && (
            <button
              onClick={() => setIsPenActive(!isPenActive)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                isPenActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-gray-800 text-gray-300 hover:text-white"
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{isPenActive ? "Pen Active" : "Draw / Pen"}</span>
            </button>
          )}

          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition"
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            <span>{isCollapsed ? "Show Stage" : "Minimize"}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Stage Viewport */}
      {!isCollapsed ? (
        <div className="relative w-full aspect-video bg-gray-950 flex items-center justify-center overflow-hidden">
          {/* Synchronized Whiteboard Drawing Layer */}
          <WhiteboardCanvas
            isTeacher={isTeacher}
            isActive={isPenActive}
            onClose={() => setIsPenActive(false)}
            roomChannel={roomChannel}
          />

          {/* Mode 1: YouTube */}
          {activeMode === "youtube" && (
            <iframe
              src={getEmbedUrl(activeUrl)}
              title="Classroom Presentation Stream"
              className="w-full h-full border-0 pointer-events-auto"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          )}

          {/* Mode 2: Live Whiteboard Slate */}
          {activeMode === "whiteboard" && (
            <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-4 select-none">
              <div className="text-center text-gray-500 text-xs">
                <Layout className="w-10 h-10 text-indigo-400 mx-auto mb-2 opacity-60" />
                <span className="font-bold text-gray-200 text-sm">Live Whiteboard Canvas</span>
                <p className="text-[11px] text-gray-400 mt-1">
                  {isTeacher 
                    ? "Top bar se 'Draw / Pen' click karke screen par likhna shuru karein." 
                    : "Teacher board par real-time draw kar rahe hain."}
                </p>
              </div>
            </div>
          )}

          {/* Mode 3: Local Uploaded Video */}
          {activeMode === "localVideo" && activeUrl && (
            <video
              ref={videoPlayerRef}
              src={activeUrl}
              controls={isTeacher}
              autoPlay
              playsInline
              onPlay={() => emitVideoControl("play")}
              onPause={() => emitVideoControl("pause")}
              onSeeked={() => emitVideoControl("seek")}
              className="w-full h-full object-contain bg-black"
            />
          )}

          {/* Mode 4: PDF Presentation */}
          {activeMode === "pdf" && activeUrl && (
            <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center p-4">
              <object
                data={activeUrl}
                type="application/pdf"
                className="w-full h-full rounded-xl hidden sm:block"
              >
                <div className="flex flex-col items-center text-center p-6 bg-gray-800 rounded-2xl">
                  <FileText className="w-12 h-12 text-indigo-400 mb-3" />
                  <p className="text-xs text-gray-300 mb-4">PDF Loaded Successfully</p>
                  <a
                    href={activeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow"
                  >
                    <ExternalLink className="w-4 h-4" /> Open Full Screen PDF
                  </a>
                </div>
              </object>

              <div className="sm:hidden flex flex-col items-center text-center p-6 bg-gray-900 rounded-2xl border border-gray-800">
                <FileText className="w-10 h-10 text-indigo-400 mb-2" />
                <span className="text-xs font-bold text-white mb-1">Presentation Document</span>
                <p className="text-[11px] text-gray-400 mb-3">Mobile view me document open karein:</p>
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Document
                </a>
              </div>
            </div>
          )}

          {/* Mode 5: Image Diagram */}
          {activeMode === "image" && activeUrl && (
            <img
              src={activeUrl}
              alt="Class Diagram"
              className="max-h-full max-w-full object-contain p-2"
            />
          )}

          {/* Mode 6: Live Announcement Notice */}
          {activeMode === "notice" && (
            <div className="p-8 text-center max-w-xl">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Class Announcement</h3>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed bg-gray-900/90 p-4 rounded-2xl border border-gray-800 shadow">
                {noticeText || "No active announcement at this moment."}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 text-center text-xs text-gray-400 bg-gray-950">
          📺 Stage is minimized. Focus is on peer webcams and discussions.
        </div>
      )}
    </div>
  );
}