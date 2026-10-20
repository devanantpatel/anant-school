import React, { useState } from "react";
import { ChevronUp, ChevronDown, Video, Maximize2, Radio } from "lucide-react";

export default function YouTubePlayer({ videoUrl, isLive = false, isCollapsed, onToggleCollapse }) {
  // Helper: YouTube URL se Video/Stream ID extract karna
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const videoId = extractYouTubeId(videoUrl) || "dQw4w9WgXcQ"; // Fallback demo video
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1&enablejsapi=1`;

  return (
    <div className="w-full bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-xl transition-all duration-300">
      
      {/* Top Bar with Live Tag & Collapse Toggle */}
      <div className="bg-gray-900/90 px-4 py-2 flex items-center justify-between text-xs border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-indigo-600/30 text-indigo-400">
            <Video className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-gray-200">Main Presentation Stage</span>
          {isLive && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
              <Radio className="w-2.5 h-2.5" />
              LIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition"
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Show Stage</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Hide Stage</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Embedded YouTube Container */}
      {!isCollapsed && (
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          <iframe
            src={embedUrl}
            title="Classroom Presentation Stream"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}

      {/* Collapsed State Bar */}
      {isCollapsed && (
        <div className="p-3 text-center text-xs text-gray-400 bg-gray-950">
          📺 Presentation is minimized. Focus is on peer webcams and discussion.
        </div>
      )}

    </div>
  );
}