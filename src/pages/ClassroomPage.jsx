import React, { useState } from "react";
import { ArrowLeft, Share2, ChevronUp, ChevronDown, Video } from "lucide-react";
import MultiMediaStage from "../components/classroom/PresentationStage/MultiMediaStage";
import TeacherMediaToolbar from "../components/classroom/PresentationStage/TeacherMediaToolbar";
import ScrollingGrid from "../components/classroom/WebGrid/ScrollingGrid";
import HostControlsBar from "../components/classroom/WebGrid/HostControlsBar";
import TabSwitcher from "../components/classroom/WorkspaceTabs/TabSwitcher";
import LiveQnA from "../components/classroom/WorkspaceTabs/LiveQnA";
import PreviousLectures from "../components/classroom/WorkspaceTabs/PreviousLectures";
import ClassworkBoard from "../components/classroom/WorkspaceTabs/ClassworkBoard";
import DiscussionRooms from "../components/classroom/WorkspaceTabs/DiscussionRooms";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";

export default function ClassroomPage({ classroom, onBack }) {
  const { user } = useAuth();

  // MultiMedia Stage State
  const [stageMode, setStageMode] = useState("youtube");
  const [contentUrl, setContentUrl] = useState("https://www.youtube.com/watch?v=jfKfPfyJRdk");
  const [noticeText, setNoticeText] = useState("");
  const [isLive, setIsLive] = useState(classroom?.isLive || false);
  const [isStageCollapsed, setIsStageCollapsed] = useState(false);

  // WebCam Video Grid Collapsible State
  const [isVideoGridCollapsed, setIsVideoGridCollapsed] = useState(false);

  // AV State
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [areAllMuted, setAreAllMuted] = useState(false);

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState("live-qna");

  const [participants, setParticipants] = useState([
    { id: "p1", name: "Ananya", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ananya", isCameraOn: false, isMuted: true, isHandRaised: false },
    { id: "p2", name: "Rohan", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Rohan", isCameraOn: true, isMuted: true, isHandRaised: true },
    { id: "p3", name: user?.name || "You", avatar: user?.avatar, isCameraOn: isCamOn, isMuted: !isMicOn, isHandRaised: isHandRaised, isSelf: true },
  ]);

 const handleUpdateContent = async (url, notice = "") => {
  if (url) setContentUrl(url);
  if (notice) setNoticeText(notice);

  // Sync to Supabase in background for all students
  if (user?.role === "teacher" && classroom?.id) {
    await supabase
      .from("classes")
      .update({
        current_stream_url: url || contentUrl,
        current_mode: stageMode,
        is_live: isLive,
      })
      .eq("id", classroom.id);
  }
};
  const handleToggleMute = (id) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isMuted: !p.isMuted } : p))
    );
  };

  // Instant Mute/Unmute Toggle without alert popups
  const handleToggleMuteAll = () => {
    const nextState = !areAllMuted;
    setAreAllMuted(nextState);
    setParticipants((prev) => prev.map((p) => ({ ...p, isMuted: nextState })));
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-md">{classroom?.title}</h2>
            <span className="text-[11px] text-gray-400 font-mono">Code: {classroom?.code}</span>
          </div>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(classroom?.code || "");
            alert("Class Code copied!");
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 transition"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Invite</span>
        </button>
      </header>

      {/* Main Room Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* 1. MultiMedia Presentation Stage */}
        <MultiMediaStage
          mode={stageMode}
          contentUrl={contentUrl}
          noticeText={noticeText}
          isLive={isLive}
          isCollapsed={isStageCollapsed}
          onToggleCollapse={() => setIsStageCollapsed(!isStageCollapsed)}
        />

        {/* 2. Teacher Tools Toolbar */}
        <TeacherMediaToolbar
          onSelectMode={(mode) => setStageMode(mode)}
          onUpdateContent={handleUpdateContent}
          onToggleLive={() => setIsLive(!isLive)}
          isLive={isLive}
        />

        {/* 3. Collapsible WebCam Room */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-xs text-gray-400">
            <span className="flex items-center gap-1 font-semibold">
              <Video className="w-3.5 h-3.5 text-indigo-400" /> Peer Video Room
            </span>
            <button
              onClick={() => setIsVideoGridCollapsed(!isVideoGridCollapsed)}
              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white"
            >
              {isVideoGridCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              <span>{isVideoGridCollapsed ? "Show Webcams" : "Hide Webcams"}</span>
            </button>
          </div>

          {!isVideoGridCollapsed && (
            <ScrollingGrid
              teacherInfo={{ name: "Lead Educator", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Host" }}
              participants={participants}
              onToggleMute={handleToggleMute}
            />
          )}

          <HostControlsBar
            isMicOn={isMicOn}
            isCamOn={isCamOn}
            isHandRaised={isHandRaised}
            areAllMuted={areAllMuted}
            onToggleMic={() => setIsMicOn(!isMicOn)}
            onToggleCam={() => setIsCamOn(!isCamOn)}
            onToggleHand={() => setIsHandRaised(!isHandRaised)}
            onToggleMuteAll={handleToggleMuteAll}
          />
        </div>

        {/* 4. Lower Workspace Tabs */}
        <div className="pt-2">
          <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
         {activeTab === "live-qna" && <LiveQnA classId={classroom?.id} />}
          {activeTab === "lectures" && (
            <PreviousLectures
              onPlayRecordedLecture={(url) => {
                setStageMode("youtube");
                setContentUrl(url);
                setIsStageCollapsed(false);
              }}
            />
          )}
          {activeTab === "classwork" && <ClassworkBoard classId={classroom?.id || "cls_1"} />}
      {activeTab === "community" && <DiscussionRooms classId={classroom?.id || "cls_1"} />}
        </div>
      </main>
    </div>
  );
}