import React, { useRef, useEffect } from "react";
import { Mic, MicOff, Hand, VideoOff } from "lucide-react";

export default function StudentTile({ participant, isTeacherView = false, onToggleMute }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && participant.mediaStream) {
      videoRef.current.srcObject = participant.mediaStream;
      // Remote peer audio ko chalne de, sirf self ko mute kare taaki echo na aaye
      videoRef.current.muted = participant.isSelf;
      videoRef.current.play().catch(() => {});
    }
  }, [participant.mediaStream, participant.isCameraOn]);

  return (
    <div className="relative w-36 h-28 sm:w-44 sm:h-32 bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-md shrink-0 flex flex-col items-center justify-center group select-none">
      
      {/* Video Feed ya Clean Avatar */}
      {participant.isCameraOn && participant.mediaStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isSelf}
          className="w-full h-full object-cover -scale-x-100"
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-1.5">
          <img
            src={participant.avatar}
            alt={participant.name}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gray-700 bg-gray-800 p-0.5 object-cover"
          />
          <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full">
            <VideoOff className="w-2.5 h-2.5" /> Off
          </span>
        </div>
      )}

      {/* Top Indicators: Bouncing Hand & Real-time Mic Status */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
        {participant.isHandRaised && (
          <span className="p-1 rounded-full bg-amber-500 text-white shadow-lg animate-bounce" title="Hand Raised">
            <Hand className="w-3 h-3" />
          </span>
        )}

        <span
          className={`p-1 rounded-full shadow ${
            participant.isMuted
              ? "bg-red-500 text-white"
              : "bg-emerald-500 text-white animate-pulse"
          }`}
          title={participant.isMuted ? "Muted" : "Speaking / Mic Active"}
        >
          {participant.isMuted ? <MicOff className="w-2.5 h-2.5" /> : <Mic className="w-2.5 h-2.5" />}
        </span>
      </div>

      {/* Bottom Name Pill */}
      <div className="absolute bottom-2 left-2 right-2 z-10 pointer-events-none">
        <span className="inline-block text-[10px] font-semibold text-white bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded-md truncate max-w-full">
          {participant.name} {participant.isSelf ? "(You)" : ""}
        </span>
      </div>

      {/* Host Specific Mute Button */}
      {isTeacherView && !participant.isSelf && !participant.isMuted && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex items-center justify-center p-2 transition duration-200 z-20">
          <button
            onClick={() => onToggleMute(participant.id)}
            className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition"
          >
            Mute Student
          </button>
        </div>
      )}
    </div>
  );
}