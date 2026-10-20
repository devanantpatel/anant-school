import React, { useState } from "react";
import { FileText, Download, UploadCloud, CheckCircle, Plus } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function ClassworkBoard() {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";

  const [items, setItems] = useState([
    { id: 1, title: "Lecture Notes - Chapter 1 (PDF)", type: "Notes", size: "2.4 MB", date: "Today" },
    { id: 2, title: "Homework: Solve Exercises 1 to 5", type: "Assignment", due: "Tomorrow", isSubmitted: false },
  ]);

  const handleUploadClick = () => {
    alert("Telegram Bot Storage Upload will handle this file directly!");
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-b-2xl border-x border-b border-gray-200 dark:border-gray-800 space-y-4">
      {/* Teacher Action */}
      {isTeacher && (
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <span className="text-xs font-semibold text-gray-500">Instructor Workspace</span>
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Notes / Assignment</span>
          </button>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h4>
                <span className="text-[10px] text-gray-500">
                  {item.type} • {item.due ? `Due: ${item.due}` : item.size}
                </span>
              </div>
            </div>

            {/* Student Action */}
            <div className="flex items-center gap-2">
              {item.type === "Notes" ? (
                <button className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">
                  <Download className="w-3.5 h-3.5" />
                  <span>Get</span>
                </button>
              ) : (
                <button
                  onClick={handleUploadClick}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Turn In</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}