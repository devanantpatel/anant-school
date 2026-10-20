import React, { useState, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../services/supabaseClient";

export default function LiveQnA({ classId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Initial messages fetch & Realtime subscription
  useEffect(() => {
    if (!classId) return;

    // Fetch existing live-qna messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("class_messages")
        .select("*")
        .eq("class_id", classId)
        .eq("channel", "live-qna")
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
    };

    fetchMessages();

    // Setup Supabase Realtime channel
    const channel = supabase
      .channel(`live_qna_${classId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "class_messages",
          filter: `class_id=eq.${classId}`,
        },
        (payload) => {
          if (payload.new.channel === "live-qna") {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId]);

  // 2. Send message to Supabase
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !classId) return;

    const textToSend = input.trim();
    setInput("");

    const { error } = await supabase.from("class_messages").insert([
      {
        class_id: classId,
        channel: "live-qna",
        sender_name: user?.name || "Student",
        sender_role: user?.role || "student",
        sender_avatar: user?.avatar || "",
        text: textToSend,
      },
    ]);

    if (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-80 bg-white dark:bg-gray-900 rounded-b-2xl border-x border-b border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Messages Viewport */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <span className="text-xs">Loading live chat...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-xs text-gray-500 py-10">
            No doubts or comments yet. Be the first to ask!
          </div>
        ) : (
          messages.map((msg) => {
            const isHost = msg.sender_role === "teacher";
            return (
              <div key={msg.id} className="flex flex-col text-xs">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`font-bold ${isHost ? "text-indigo-600 dark:text-indigo-400" : "text-gray-700 dark:text-gray-300"}`}>
                    {msg.sender_name}
                  </span>
                  {isHost && (
                    <span className="text-[9px] px-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded">
                      Host
                    </span>
                  )}
                </div>
                <p className="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                  {msg.text}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Input Field */}
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