import React, { useState } from "react";
import { Video, Upload, FileText, Image as ImageIcon, Megaphone, Layout } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function TeacherMediaToolbar({ onBroadcastStage, isLive, onToggleLive, isTeacherOverride }) {
  const { user } = useAuth();
  const isTeacher = isTeacherOverride !== undefined ? isTeacherOverride : user?.role === "teacher";

  // Agar user teacher nahi hai toh tools hide rahenge
  if (!isTeacher) return null;

  const [activeTab, setActiveTab] = useState("youtube");
  const [ytLink, setYtLink] = useState("");
  const [notice, setNotice] = useState("");

  const handleYtSubmit = (e) => {
    e.preventDefault();
    if (!ytLink.trim()) return;
    onBroadcastStage("youtube", ytLink.trim(), "");
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    onBroadcastStage(type, objectUrl, "");
  };

  const handleNoticeSubmit = (e) => {
    e.preventDefault();
    if (!notice.trim()) return;
    onBroadcastStage("notice", "", notice.trim());
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 p-2.5 sm:p-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
      {/* Mode Selectors */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <button
          onClick={() => {
            setActiveTab("youtube");
            onBroadcastStage("youtube", ytLink || "https://www.youtube.com/watch?v=jfKfPfyJRdk", "");
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
            onBroadcastStage("whiteboard", "", "");
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
            activeTab === "whiteboard" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
          }`}
        >
          <Layout className="w-3.5 h-3.5" /> Whiteboard
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

      {/* Forms */}
      {activeTab === "youtube" && (
        <form onSubmit={handleYtSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Paste YouTube Link or Video ID to Cast..."
            value={ytLink}
            onChange={(e) => setYtLink(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
          />
          <button type="submit" className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold active:scale-95 transition">
            Cast to All
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
          <button type="submit" className="px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold active:scale-95 transition">
            Broadcast
          </button>
        </form>
      )}
    </div>
  );
}