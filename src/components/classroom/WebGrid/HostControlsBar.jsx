import React from "react";
import { Mic, MicOff, Video, VideoOff, Hand, VolumeX, Volume2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function HostControlsBar({
  isMicOn,
  isCamOn,
  isHandRaised,
  areAllMuted,
  onToggleMic,
  onToggleCam,
  onToggleHand,
  onToggleMuteAll,
}) {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";

  return (
    <div className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-white shadow-md my-2">
      {/* Self Controls (Mic / Camera) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMic}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            isMicOn
              ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          <span>{isMicOn ? "Mic On" : "Muted"}</span>
        </button>

        <button
          onClick={onToggleCam}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            isCamOn
              ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isCamOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
          <span>{isCamOn ? "Camera On" : "Camera Off"}</span>
        </button>
      </div>

      {/* Student Action: Raise Hand */}
      {!isTeacher && (
        <button
          onClick={onToggleHand}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            isHandRaised
              ? "bg-amber-500 text-white animate-pulse"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
          }`}
        >
          <Hand className="w-3.5 h-3.5" />
          <span>{isHandRaised ? "Hand Raised" : "Raise Hand"}</span>
        </button>
      )}

      {/* Teacher Only: Instant Mute All / Unmute All (Zero Popups) */}
      {isTeacher && (
        <button
          onClick={onToggleMuteAll}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm ${
            areAllMuted
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {areAllMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{areAllMuted ? "Unmute All" : "Mute All"}</span>
        </button>
      )}
    </div>
  );
}