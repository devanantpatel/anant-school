import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  UploadCloud, 
  Plus, 
  Loader2, 
  Trash2, 
  X, 
  AlertCircle,
  Eye,
  Calendar,
  Layers
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../services/supabaseClient";
import { uploadToTelegramWithProgress, deleteFromTelegram } from "../../../services/telegramStorage";
import CenterModal from "../../common/CenterModal";

export default function ClassworkBoard({ classId, onPreviewMedia }) {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [titlePrefix, setTitlePrefix] = useState("");
  const [type, setType] = useState("Notes");
  const [dueDate, setDueDate] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Multi-upload Queue (Array of active uploading files)
  const [uploadQueue, setUploadQueue] = useState([]);

  // Center Modal Delete State
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    item: null,
  });

  const fetchClasswork = async () => {
    if (!classId) return;
    try {
      const { data, error } = await supabase
        .from("classwork")
        .select("*")
        .eq("class_id", classId)
        .order("created_at", { ascending: false });

      if (!error && data) setItems(data);
    } catch (err) {
      console.error("Error fetching classwork:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasswork();

    const channel = supabase
      .channel(`classwork_stream_${classId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "classwork", filter: `class_id=eq.${classId}` },
        () => fetchClasswork()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId]);

  // Handle Multi-File Upload Queue
  const handleStartMultiUpload = (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    const filesArray = Array.from(selectedFiles);
    const itemType = type;
    const itemDue = dueDate;
    const baseTitle = titlePrefix.trim();

    setModalOpen(false);
    setTitlePrefix("");
    setSelectedFiles([]);
    setDueDate("");

    // Create unique task for each file
    const newTasks = filesArray.map((file, idx) => ({
      taskId: "task_" + Date.now() + "_" + idx,
      title: baseTitle ? (filesArray.length > 1 ? `${baseTitle} (Part ${idx + 1})` : baseTitle) : file.name.replace(/\.[^/.]+$/, ""),
      fileName: file.name,
      type: itemType,
      percentage: 0,
      speed: "Connecting...",
      loadedMB: "0",
      totalMB: (file.size / (1024 * 1024)).toFixed(1),
      error: null,
      fileRef: file,
    }));

    // Add all to active upload queue
    setUploadQueue((prev) => [...newTasks, ...prev]);

    // Trigger uploads concurrently
    newTasks.forEach((task) => {
      uploadToTelegramWithProgress(task.fileRef, (progress) => {
        setUploadQueue((prevQueue) =>
          prevQueue.map((item) =>
            item.taskId === task.taskId
              ? {
                  ...item,
                  percentage: progress.percentage,
                  speed: progress.speed,
                  loadedMB: progress.loadedMB,
                  totalMB: progress.totalMB,
                }
              : item
          )
        );
      })
        .then(async (uploaded) => {
          // Record in Supabase
          const { error } = await supabase.from("classwork").insert([
            {
              class_id: classId,
              title: task.title,
              type: task.type,
              file_url: uploaded.fileUrl,
              telegram_message_id: uploaded.messageId,
              due_date: task.type === "Assignment" ? (itemDue || "Upcoming") : uploaded.fileSize,
            },
          ]);

          if (error) throw error;

          // Remove from uploading queue upon success
          setUploadQueue((prevQueue) => prevQueue.filter((item) => item.taskId !== task.taskId));
          fetchClasswork();
        })
        .catch((err) => {
          setUploadQueue((prevQueue) =>
            prevQueue.map((item) =>
              item.taskId === task.taskId
                ? { ...item, error: err.message || "Upload Failed" }
                : item
            )
          );
        });
    });
  };

  const removeFailedTask = (taskId) => {
    setUploadQueue((prev) => prev.filter((item) => item.taskId !== taskId));
  };

  const promptDelete = (item) => {
    setDeleteDialog({
      isOpen: true,
      item: item,
    });
  };

  const executePermanentDelete = async () => {
    const item = deleteDialog.item;
    setDeleteDialog({ isOpen: false, item: null });
    if (!item) return;

    try {
      if (item.telegram_message_id) {
        await deleteFromTelegram(item.telegram_message_id);
      }
      const { error } = await supabase.from("classwork").delete().eq("id", item.id);
      if (error) throw error;
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      alert("Failed to delete material: " + err.message);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-b-2xl border-x border-b border-gray-200 dark:border-gray-800 space-y-4">
      {/* Header */}
      {isTeacher && (
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
              Course Material & Cloud Vault
            </h3>
            <p className="text-[11px] text-gray-500">Supports batch multi-file uploads with Telegram sync.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 active:scale-95 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Material</span>
          </button>
        </div>
      )}

      {/* Tiles Container */}
      <div className="space-y-3">
        
        {/* Active Multi-Upload Tiles Queue */}
        {uploadQueue.map((uploadTask) => (
          <div
            key={uploadTask.taskId}
            className="p-4 rounded-2xl border-2 border-indigo-500/80 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md animate-fadeIn space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 shadow">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="truncate">{uploadTask.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono font-bold shrink-0">
                      {uploadTask.percentage}%
                    </span>
                  </h4>
                  <span className="text-[11px] text-gray-500 truncate block mt-0.5">
                    {uploadTask.fileName} • {uploadTask.type}
                  </span>
                </div>
              </div>

              {uploadTask.error && (
                <button 
                  onClick={() => removeFailedTask(uploadTask.taskId)}
                  className="text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* In-Card Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-200 rounded-full ${
                  uploadTask.error ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-purple-600"
                }`}
                style={{ width: `${uploadTask.percentage}%` }}
              />
            </div>

            {/* In-Card Status Details */}
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-mono">
              <span>{uploadTask.loadedMB} MB / {uploadTask.totalMB} MB transferred</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {uploadTask.error ? (
                  <span className="text-red-500 flex items-center gap-1 font-sans">
                    <AlertCircle className="w-3.5 h-3.5" /> Upload Failed
                  </span>
                ) : (
                  `⚡ ${uploadTask.speed}`
                )}
              </span>
            </div>
          </div>
        ))}

        {/* Existing Materials */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <span className="text-xs">Loading classroom materials...</span>
          </div>
        ) : items.length === 0 && uploadQueue.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            No lecture notes or assignments uploaded yet.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  item.type === "Notes" 
                    ? "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                    : "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                }`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{item.type}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {item.due_date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {onPreviewMedia && item.file_url && (
                  <button
                    onClick={() => onPreviewMedia(item.file_url, item.type.toLowerCase().includes("pdf") ? "pdf" : "image")}
                    className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
                    title="Cast to Stage"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}

                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:text-indigo-600 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>

                {isTeacher && (
                  <button
                    onClick={() => promptDelete(item)}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                    title="Delete permanently from App & Telegram"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal (Multiple File Picking Enabled) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              Upload Course Material
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Select single or multiple files to upload simultaneously.
            </p>

            <form onSubmit={handleStartMultiUpload} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Title (Optional for multiple files)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 3 Notes (Leave blank to use filename)"
                  value={titlePrefix}
                  onChange={(e) => setTitlePrefix(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Material Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType("Notes")}
                    className={`py-2 rounded-xl font-semibold border transition ${
                      type === "Notes" ? "bg-indigo-600 text-white border-transparent shadow-sm" : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    Lecture Notes
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("Assignment")}
                    className={`py-2 rounded-xl font-semibold border transition ${
                      type === "Assignment" ? "bg-indigo-600 text-white border-transparent shadow-sm" : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    Assignment
                  </button>
                </div>
              </div>

              {type === "Assignment" && (
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Submission Deadline</label>
                  <input
                    type="text"
                    placeholder="e.g. Friday 6:00 PM"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Select Files (Multiple allowed)
                </label>
                <input
                  type="file"
                  multiple
                  required
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="w-full text-[11px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-200 hover:file:bg-gray-200"
                />
                {selectedFiles.length > 0 && (
                  <span className="text-[10px] text-indigo-500 font-semibold mt-1 block">
                    ✓ {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected for batch upload
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={selectedFiles.length === 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold shadow-md active:scale-95 transition mt-2"
              >
                <Layers className="w-4 h-4" />
                <span>Start Batch Upload ({selectedFiles.length || 0})</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <CenterModal
        isOpen={deleteDialog.isOpen}
        type="danger"
        title="Delete Material?"
        message={`"${deleteDialog.item?.title}" will be permanently removed from this classroom and purged from Telegram cloud storage.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={executePermanentDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, item: null })}
      />
    </div>
  );
}