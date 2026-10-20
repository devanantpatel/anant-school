import React, { useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function LiveQnA() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, sender: "Instructor", text: "Welcome everyone! Feel free to post questions here during the stream.", isHost: true },
    { id: 2, sender: "Rahul Verma", text: "Sir, could you explain the 3rd formula again?", isHost: false },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: user?.name || "Student",
        text: input.trim(),
        isHost: user?.role === "teacher",
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-80 bg-white dark:bg-gray-900 rounded-b-2xl border-x border-b border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col text-xs">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`font-bold ${msg.isHost ? "text-indigo-600 dark:text-indigo-400" : "text-gray-700 dark:text-gray-300"}`}>
                {msg.sender}
              </span>
              {msg.isHost && (
                <span className="text-[9px] px-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded">Host</span>
              )}
            </div>
            <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
              {msg.text}
            </p>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-2.5 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a quick doubt or comment..."
          className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}