import React, { useRef, useEffect } from "react";
import StudentTile from "./StudentTile";
import { Users, Crown, VideoOff, Mic, MicOff } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function ScrollingGrid({ 
  teacherInfo, 
  teacherStream, 
  isTeacherCamOn, 
  isTeacherMuted,
  isTeacherOnline = false,
  participants = [], 
  onToggleMute 
}) {
  const { user } = useAuth();
  const isTeacherView = user?.role === "teacher";
  const teacherVideoRef = useRef(null);

  useEffect(() => {
    const videoEl = teacherVideoRef.current;
    if (videoEl && teacherStream) {
      videoEl.srcObject = teacherStream;
      videoEl.muted = isTeacherView; // Self view is muted to avoid echo; students hear audio
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Teacher video autoplay deferred:", err);
        });
      }
    }
  }, [teacherStream, isTeacherCamOn, isTeacherView]);

  return (
    <div className="w-full bg-gray-950 p-3 sm:p-4 rounded-2xl border border-gray-800 shadow-inner">
      <div className="flex items-center justify-between text-xs text-gray-400 mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-gray-300">
            Room Attendees ({participants.length + (teacherInfo ? 1 : 0)})
          </span>
        </div>
        <span className="text-[11px] text-gray-500">Horizontal scroll for peers →</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        
        {/* Pinned Teacher (Host) Spotlight */}
        <div className="relative w-36 h-28 sm:w-44 sm:h-32 bg-indigo-950/40 rounded-2xl overflow-hidden border-2 border-indigo-500/80 shadow-lg shrink-0 flex flex-col items-center justify-center">
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-600 text-white text-[9px] font-bold shadow">
            <Crown className="w-2.5 h-2.5" /> Host
          </div>

          {/* Teacher Indicators */}
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
            <span
              className={`p-1 rounded-full shadow ${
                isTeacherMuted ? "bg-red-500 text-white" : "bg-emerald-500 text-white animate-pulse"
              }`}
              title={isTeacherMuted ? "Teacher is Muted" : "Teacher is Speaking"}
            >
              {isTeacherMuted ? <MicOff className="w-2.5 h-2.5" /> : <Mic className="w-2.5 h-2.5" />}
            </span>

            <span
              className={`w-2 h-2 rounded-full ${
                isTeacherOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-500"
              }`}
              title={isTeacherOnline ? "Teacher is Online" : "Teacher is Offline"}
            />
          </div>

          {/* Live Teacher Camera Viewport */}
          {isTeacherCamOn && teacherStream ? (
            <video
              ref={teacherVideoRef}
              autoPlay
              playsInline
              muted={isTeacherView}
              className="w-full h-full object-cover -scale-x-100 bg-black"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5">
              <img
                src={teacherInfo?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=Teacher"}
                alt="Teacher"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-indigo-400 p-0.5 bg-gray-900 object-cover"
              />
              <span className="text-[10px] text-gray-400 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full">
                <VideoOff className="w-2.5 h-2.5" /> {isTeacherOnline ? "Camera Off" : "Offline"}
              </span>
            </div>
          )}

          <div className="absolute bottom-2 left-2 right-2 z-10 pointer-events-none">
            <span className="inline-block text-[10px] font-semibold text-white bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded-md truncate max-w-full">
              {teacherInfo?.name || "Educator"}
            </span>
          </div>
        </div>

        {participants.length > 0 && <div className="h-20 w-[1px] bg-gray-800 shrink-0" />}

        {/* Dynamic Students Carousel */}
        {participants.map((student) => (
          <StudentTile
            key={student.id}
            participant={student}
            isTeacherView={isTeacherView}
            onToggleMute={onToggleMute}
          />
        ))}
      </div>
    </div>
  );
}