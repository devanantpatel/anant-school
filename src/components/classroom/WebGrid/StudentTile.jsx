import React from "react";
import { Mic, MicOff, Hand, VideoOff } from "lucide-react";

export default function StudentTile({ participant, isTeacherView = false, onToggleMute }) {
  return (
    <div className="relative w-36 h-28 sm:w-44 sm:h-32 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-md shrink-0 flex flex-col items-center justify-center group">
      
      {/* Video or Avatar Placeholder */}
      {participant.isCameraOn ? (
        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs text-gray-400">
          <video
            autoPlay
            playsInline
            muted={participant.isSelf}
            className="w-full h-full object-cover -scale-x-100"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <img
            src={participant.avatar}
            alt={participant.name}
            className="w-10 h-10 rounded-full border border-gray-700 bg-gray-800 p-0.5"
          />
          <span className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
            <VideoOff className="w-2.5 h-2.5" /> Off
          </span>
        </div>
      )}

      {/* Name Tag & Indicators */}
      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
        <span className="text-[10px] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded truncate max-w-[80px]">
          {participant.name} {participant.isSelf ? "(You)" : ""}
        </span>

        <div className="flex items-center gap-1">
          {participant.isHandRaised && (
            <span className="p-0.5 rounded bg-amber-500 text-white animate-bounce">
              <Hand className="w-2.5 h-2.5" />
            </span>
          )}

          <span
            className={`p-0.5 rounded ${
              participant.isMuted
                ? "bg-red-500/80 text-white"
                : "bg-emerald-500/80 text-white"
            }`}
          >
            {participant.isMuted ? (
              <MicOff className="w-2.5 h-2.5" />
            ) : (
              <Mic className="w-2.5 h-2.5" />
            )}
          </span>
        </div>
      </div>

      {/* Teacher Action Overlay on Hover */}
      {isTeacherView && !participant.isSelf && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition">
          <button
            onClick={() => onToggleMute(participant.id)}
            className="px-2 py-1 rounded-md text-[10px] font-semibold bg-red-600 text-white hover:bg-red-700 transition"
          >
            {participant.isMuted ? "Unmute Req" : "Mute"}
          </button>
        </div>
      )}
    </div>
  );
}