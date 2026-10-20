import React, { useRef, useEffect } from "react";
import StudentTile from "./StudentTile";
import { Users, Crown, VideoOff } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function ScrollingGrid({ 
  teacherInfo, 
  teacherStream, 
  isTeacherCamOn, 
  participants, 
  onToggleMute 
}) {
  const { user } = useAuth();
  const isTeacherView = user?.role === "teacher";
  const teacherVideoRef = useRef(null);

  useEffect(() => {
    if (teacherVideoRef.current && teacherStream) {
      teacherVideoRef.current.srcObject = teacherStream;
    }
  }, [teacherStream, isTeacherCamOn]);

  return (
    <div className="w-full bg-gray-950 p-3 rounded-2xl border border-gray-800">
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2.5 px-1">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span>Room Attendees ({participants.length + 1})</span>
        </div>
        <span className="text-[10px] text-gray-500">Peer video carousel</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {/* Pinned Teacher Card with Real Camera Feed */}
        <div className="relative w-40 h-28 sm:w-48 sm:h-32 bg-indigo-950/40 rounded-xl overflow-hidden border-2 border-indigo-500/80 shadow-lg shrink-0 flex flex-col items-center justify-center">
          <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-bold">
            <Crown className="w-2.5 h-2.5" /> Host
          </div>

          {isTeacherCamOn && teacherStream ? (
            <video
              ref={teacherVideoRef}
              autoPlay
              playsInline
              muted={isTeacherView}
              className="w-full h-full object-cover -scale-x-100"
            />
          ) : (
            <div className="flex flex-col items-center">
              <img
                src={teacherInfo?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=Host"}
                alt="Teacher"
                className="w-11 h-11 rounded-full border border-indigo-400 p-0.5 mb-1"
              />
              <span className="text-xs font-bold text-white truncate max-w-[120px]">
                {teacherInfo?.name || "Educator"}
              </span>
              <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                <VideoOff className="w-2.5 h-2.5" /> Camera Off
              </span>
            </div>
          )}
        </div>

        <div className="h-20 w-[1px] bg-gray-800 shrink-0" />

        {/* Student Webcams Carousel */}
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