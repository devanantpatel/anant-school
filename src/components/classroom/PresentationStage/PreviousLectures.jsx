import React from "react";
import { PlayCircle, Calendar, Clock } from "lucide-react";

export default function PreviousLectures({ onPlayRecordedLecture }) {
  const lectures = [
    {
      id: "lec_1",
      title: "Lecture 01: Introduction & Basic Principles",
      date: "Oct 18, 2026",
      duration: "45 mins",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&q=80",
      videoUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    },
    {
      id: "lec_2",
      title: "Lecture 02: Deep Dive into Architecture",
      date: "Oct 19, 2026",
      duration: "52 mins",
      thumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&q=80",
      videoUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    },
  ];

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-b-2xl border-x border-b border-gray-200 dark:border-gray-800">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
        Archived Lectures & Recordings
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {lectures.map((lec) => (
          <div
            key={lec.id}
            onClick={() => onPlayRecordedLecture(lec.videoUrl)}
            className="flex gap-3 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 hover:border-indigo-500 cursor-pointer transition group"
          >
            <div className="relative w-28 h-18 rounded-lg overflow-hidden shrink-0 bg-gray-800">
              <img src={lec.thumbnail} alt={lec.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <PlayCircle className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between py-0.5">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2">
                {lec.title}
              </h4>
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {lec.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lec.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}