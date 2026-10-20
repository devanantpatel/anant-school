import React, { useState } from "react";
import { Hash, Send, Paperclip } from "lucide-react";

export default function DiscussionRooms() {
  const [activeChannel, setActiveChannel] = useState("general");
  const [messages, setMessages] = useState([
    { id: 1, channel: "general", user: "Dev Anant", text: "Guys, please share yesterday's formula sheet." },
    { id: 2, channel: "doubts", user: "Aman", text: "How do we derive equation 2?" },
  ]);
  const [text, setText] = useState("");

  const filteredMessages = messages.filter((m) => m.channel === activeChannel);

  const handlePost = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), channel: activeChannel, user: "You", text: text.trim() },
    ]);
    setText("");
  };

  return (
    <div className="flex flex-col sm:flex-row h-96 bg-white dark:bg-gray-900 rounded-b-2xl border-x border-b border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Channels Sidebar */}
      <div className="w-full sm:w-44 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 p-2 space-y-1 bg-gray-50/50 dark:bg-gray-950/40">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2">Channels</span>
        <button
          onClick={() => setActiveChannel("general")}
          className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeChannel === "general"
              ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          <span>general</span>
        </button>
        <button
          onClick={() => setActiveChannel("doubts")}
          className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeChannel === "doubts"
              ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          <span>doubts</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className="text-xs">
              <span className="font-bold text-gray-800 dark:text-gray-200 mr-2">{msg.user}:</span>
              <span className="text-gray-600 dark:text-gray-300">{msg.text}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handlePost} className="p-2 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message #${activeChannel}...`}
            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
          />
          <button type="submit" className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}