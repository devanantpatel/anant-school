import React, { useState, useEffect } from "react";
import { Hash, Send, Loader2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../services/supabaseClient";

export default function DiscussionRooms({ classId }) {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState("general");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Fetch & Realtime Subscription for Community Channels
  useEffect(() => {
    if (!classId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("class_messages")
        .select("*")
        .eq("class_id", classId)
        .in("channel", ["general", "doubts"])
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
    };

    fetchMessages();

    const channel = supabase
      .channel(`community_${classId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "class_messages",
          filter: `class_id=eq.${classId}`,
        },
        (payload) => {
          if (payload.new.channel === "general" || payload.new.channel === "doubts") {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId]);

  // 2. Post Message
  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim() || !classId) return;

    const messageToSend = text.trim();
    setText("");

    const { error } = await supabase.from("class_messages").insert([
      {
        class_id: classId,
        channel: activeChannel,
        sender_name: user?.name || "Student",
        sender_role: user?.role || "student",
        sender_avatar: user?.avatar || "",
        text: messageToSend,
      },
    ]);

    if (error) {
      console.error("Supabase Post Error:", error);
      alert("Error sending message: " + error.message);
    }
  };

  const filteredMessages = messages.filter((m) => m.channel === activeChannel);

  return (
    <div className="flex flex-col sm:flex-row h-96 bg-white dark:bg-gray-900 rounded-b-2xl border-x border-b border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Channels Sidebar */}
      <div className="w-full sm:w-44 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 p-2 space-y-1 bg-gray-50/50 dark:bg-gray-950/40">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2">Channels</span>
        <button
          onClick={() => setActiveChannel("general")}
          className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeChannel === "general"
              ? "bg-indigo-600 text-white shadow-sm"
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
              ? "bg-indigo-600 text-white shadow-sm"
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
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span className="text-xs">Loading channel...</span>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center text-xs text-gray-500 py-8">
              No discussions in #{activeChannel} yet. Start the talk!
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div key={msg.id} className="text-xs flex flex-col bg-gray-50 dark:bg-gray-800/40 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-gray-900 dark:text-gray-200">{msg.sender_name}</span>
                  <span className="text-[10px] text-gray-400 capitalize">({msg.sender_role})</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">{msg.text}</span>
              </div>
            ))
          )}
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