import React, { useState } from "react";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Hand, 
  VolumeX, 
  Volume2, 
  Smile, 
  ArrowDownCircle, 
  Send 
} from "lucide-react";
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
  onLowerAllHands,
  onSendReaction,
}) {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customEmoji, setCustomEmoji] = useState("");

  const quickEmojis = ["👍", "👏", "❤️", "🔥", "😂", "😮", "🎉", "💡"];

  const handleCustomSend = (e) => {
    e.preventDefault();
    if (!customEmoji.trim()) return;
    onSendReaction(customEmoji.trim());
    setCustomEmoji("");
    setShowEmojiPicker(false);
  };

  return (
    <div className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-white shadow-md my-2 relative">
      
      {/* 1. Self Mic & Camera */}
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

      {/* 2. Student Only Actions: Hand Raise & Reaction (Teacher side se Emoji Removed) */}
      {!isTeacher && (
        <div className="flex items-center gap-2">
          {/* Hand Raise / Lower Hand Toggle */}
          <button
            onClick={onToggleHand}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
              isHandRaised
                ? "bg-amber-500 text-white animate-pulse"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>{isHandRaised ? "Lower Hand" : "Raise Hand"}</span>
          </button>

          {/* Student Emoji Reaction Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition"
              title="Send Reaction"
            >
              <Smile className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">React</span>
            </button>

            {/* Emoji Picker Popup */}
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-64 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-2xl p-2.5 shadow-2xl z-30 animate-fadeIn">
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onSendReaction(emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="p-1.5 text-lg hover:bg-gray-800 rounded-xl transition active:scale-125 text-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleCustomSend} className="flex gap-1.5 pt-1.5 border-t border-gray-800">
                  <input
                    type="text"
                    maxLength={4}
                    value={customEmoji}
                    onChange={(e) => setCustomEmoji(e.target.value)}
                    placeholder="Type emoji..."
                    className="flex-1 px-2.5 py-1 text-xs rounded-xl bg-gray-800 border border-gray-700 text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Teacher Bulk Controls */}
      {isTeacher && (
        <div className="flex items-center gap-2">
          {/* Lower All Hands */}
          <button
            onClick={onLowerAllHands}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/30 text-xs font-semibold transition active:scale-95"
            title="Lower All Raised Hands"
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lower All Hands</span>
          </button>

          {/* Mute All */}
          <button
            onClick={onToggleMuteAll}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm ${
              areAllMuted ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {areAllMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{areAllMuted ? "Unmute All" : "Mute All"}</span>
          </button>
        </div>
      )}
    </div>
  );
}