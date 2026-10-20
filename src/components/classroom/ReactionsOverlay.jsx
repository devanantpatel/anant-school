import React from "react";

export default function ReactionsOverlay({ reactions }) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="absolute bottom-20 text-4xl sm:text-5xl animate-floatUp select-none flex flex-col items-center"
          style={{
            left: `${r.left}%`,
          }}
        >
          <span className="drop-shadow-lg filter">{r.emoji}</span>
          <span className="text-[10px] font-bold text-white bg-black/80 px-2 py-0.5 rounded-full mt-1 border border-gray-700 shadow">
            {r.senderName}
          </span>
        </div>
      ))}
    </div>
  );
}