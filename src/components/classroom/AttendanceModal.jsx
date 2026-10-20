import React from "react";
import { X, Download, UserCheck, Clock, Users } from "lucide-react";

export default function AttendanceModal({ isOpen, onClose, attendanceLogs, classTitle }) {
  if (!isOpen) return null;

  // Download Attendance as CSV file
  const downloadCSV = () => {
    if (attendanceLogs.length === 0) return;

    const headers = "Student Name,Role,Joined At (UTC)\n";
    const rows = attendanceLogs
      .map((log) => `"${log.user_name}","${log.user_role}","${new Date(log.joined_at).toLocaleString()}"`)
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Attendance_${classTitle.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700 relative max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Live Attendance Register
            </h3>
            <p className="text-xs text-gray-500">
              {attendanceLogs.length} verified attendees recorded
            </p>
          </div>
        </div>

        {/* Attendance List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
          {attendanceLogs.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-400">
              No students joined this session yet.
            </div>
          ) : (
            attendanceLogs.map((log, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-900/40 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-gray-400 text-[10px] w-4">{idx + 1}.</span>
                  <div>
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200">{log.user_name}</h5>
                    <span className="text-[10px] text-indigo-500 capitalize">{log.user_role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(log.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* CSV Download Trigger */}
        <button
          onClick={downloadCSV}
          disabled={attendanceLogs.length === 0}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md active:scale-95 transition"
        >
          <Download className="w-4 h-4" />
          <span>Download Attendance Report (.CSV)</span>
        </button>
      </div>
    </div>
  );
}