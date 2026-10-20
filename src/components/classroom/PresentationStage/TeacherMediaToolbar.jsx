import React, { useState } from "react";
import { Video, Upload, FileText, Image as ImageIcon, Megaphone, Layout, Monitor } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function TeacherMediaToolbar({ onSelectMode, onUpdateContent, onToggleLive, isLive }) {
  const { user } = useAuth();
  if (user?.role !== "teacher") return null;

  const [activeTab, setActiveTab] = useState("youtube");
  const [ytLink, setYtLink] = useState("");
  const [notice, setNotice] = useState("");
  const [showSoonToast, setShowSoonToast] = useState(false);

  const handleYtSubmit = (e) => {
    e.preventDefault();
    if (!ytLink.trim()) return;
    onSelectMode("youtube");
    onUpdateContent(ytLink.trim());
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    onSelectMode(type);
    onUpdateContent(objectUrl);
  };

  const handleNoticeSubmit = (e) => {
    e.preventDefault();
    if (!notice.trim()) return;
    onSelectMode("notice");
    onUpdateContent("", notice.trim());
  };

  const handleScreenShareClick = () => {
    setShowSoonToast(true);
    setTimeout(() => setShowSoonToast(false), 2500);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 p-2.5 sm:p-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3 relative">
      {/* Mode Selectors */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <button
          onClick={() => {
            setActiveTab("youtube");
            onSelectMode("youtube");
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
            activeTab === "youtube" ? "bg-red-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
          }`}
        >
          <Video className="w-3.5 h-3.5" /> YouTube
        </button>

        <button
          onClick={() => {
            setActiveTab("whiteboard");
            onSelectMode("whiteboard");
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
            activeTab === "whiteboard" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
          }`}
        >
          <Layout className="w-3.5 h-3.5" /> Whiteboard
        </button>

        {/* Screen Share (No Popup, Smooth Badge Status) */}
        <button
          onClick={handleScreenShareClick}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-200 transition shrink-0 relative"
        >
          <Monitor className="w-3.5 h-3.5 text-indigo-400" />
          <span>Screen Share</span>
          <span className="text-[9px] px-1 bg-amber-500/20 text-amber-400 rounded">Soon</span>
        </button>

        <label className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition shrink-0 ${
          activeTab === "localVideo" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
        }`}>
          <Upload className="w-3.5 h-3.5" /> Local Video
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              setActiveTab("localVideo");
              handleFileUpload(e, "localVideo");
            }}
          />
        </label>

        <label className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition shrink-0 ${
          activeTab === "pdf" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
        }`}>
          <FileText className="w-3.5 h-3.5" /> PDF
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              setActiveTab("pdf");
              handleFileUpload(e, "pdf");
            }}
          />
        </label>

        <label className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition shrink-0 ${
          activeTab === "image" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
        }`}>
          <ImageIcon className="w-3.5 h-3.5" /> Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              setActiveTab("image");
              handleFileUpload(e, "image");
            }}
          />
        </label>

        <button
          onClick={() => setActiveTab("notice")}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
            activeTab === "notice" ? "bg-amber-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" /> Notice
        </button>

        <button
          onClick={onToggleLive}
          className={`ml-auto px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
            isLive ? "bg-red-600 text-white animate-pulse" : "bg-gray-800 text-gray-300"
          }`}
        >
          {isLive ? "End Live" : "Go Live"}
        </button>
      </div>

      {/* Screen Share Coming Soon Non-Blocking Notification */}
      {showSoonToast && (
        <div className="text-[11px] text-amber-400 bg-amber-950/40 border border-amber-900/60 px-3 py-1.5 rounded-xl flex items-center justify-between animate-fadeIn">
          <span>⚡ Screen Share is in testing and will be enabled in the upcoming WebRTC patch.</span>
          <button onClick={() => setShowSoonToast(false)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Forms */}
      {activeTab === "youtube" && (
        <form onSubmit={handleYtSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Paste YouTube Link or Video ID..."
            value={ytLink}
            onChange={(e) => setYtLink(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
          />
          <button type="submit" className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold">
            Cast
          </button>
        </form>
      )}

      {activeTab === "notice" && (
        <form onSubmit={handleNoticeSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Type announcement to broadcast..."
            value={notice}
            onChange={(e) => setNotice(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
          />
          <button type="submit" className="px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold">
            Broadcast
          </button>
        </form>
      )}
    </div>
  );
}