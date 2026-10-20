import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Plus, 
  Loader2, 
  Trash2, 
  X, 
  AlertCircle,
  Eye,
  Calendar,
  Layers,
  ClipboardCheck,
  Send,
  CheckCircle2,
  Edit2,
  MessageSquare,
  RotateCcw
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../services/supabaseClient";
import { uploadToTelegramWithProgress, deleteFromTelegram } from "../../../services/telegramStorage";
import CenterModal from "../../common/CenterModal";
import SubmitAssignmentModal from "./SubmitAssignmentModal";
import TeacherGradingModal from "./TeacherGradingModal";

export default function ClassworkBoard({ classId, onPreviewMedia }) {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Student Submissions State Map: { [classwork_id]: submissionObject }
  const [studentSubmissions, setStudentSubmissions] = useState({});

  // Form states
  const [titlePrefix, setTitlePrefix] = useState("");
  const [type, setType] = useState("Notes");
  const [dueDate, setDueDate] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Multi-upload Queue
  const [uploadQueue, setUploadQueue] = useState([]);

  // Modals
  const [activeSubmissionAssignment, setActiveSubmissionAssignment] = useState(null);
  const [activeGradingAssignment, setActiveGradingAssignment] = useState(null);

  // Custom Center Modal States
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    item: null,
    isStudentUnsubmit: false,
  });

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

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

  // Fetch Student's own submissions for this class
  const fetchStudentSubmissions = async () => {
    if (!classId || !user?.id || isTeacher) return;
    const { data } = await supabase
      .from("assignment_submissions")
      .select("*")
      .eq("class_id", classId)
      .eq("student_id", user.id);

    if (data) {
      const map = {};
      data.forEach((sub) => {
        map[sub.classwork_id] = sub;
      });
      setStudentSubmissions(map);
    }
  };

  useEffect(() => {
    fetchClasswork();
    fetchStudentSubmissions();

    // Realtime listeners
    const channel = supabase
      .channel(`classwork_stream_${classId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "classwork", filter: `class_id=eq.${classId}` },
        () => fetchClasswork()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assignment_submissions", filter: `class_id=eq.${classId}` },
        () => fetchStudentSubmissions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId, user?.id]);

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

    setUploadQueue((prev) => [...newTasks, ...prev]);

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
          setUploadQueue((prevQueue) => prevQueue.filter((item) => item.taskId !== task.taskId));
          fetchClasswork();
          showToast(`"${task.title}" upload ho gaya!`);
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

  // Student Unsubmit / Delete Homework
  const handleStudentUnsubmit = (submission) => {
    setDeleteDialog({
      isOpen: true,
      item: submission,
      isStudentUnsubmit: true,
    });
  };

  // Teacher Delete Material
  const promptDeleteMaterial = (item) => {
    setDeleteDialog({
      isOpen: true,
      item: item,
      isStudentUnsubmit: false,
    });
  };

  const executeConfirmedDelete = async () => {
    const { item, isStudentUnsubmit } = deleteDialog;
    setDeleteDialog({ isOpen: false, item: null, isStudentUnsubmit: false });
    if (!item) return;

    try {
      if (isStudentUnsubmit) {
        // Delete submission from Supabase
        await supabase.from("assignment_submissions").delete().eq("id", item.id);
        fetchStudentSubmissions();
        showToast("Homework unsubmitted successfully!");
      } else {
        // Teacher deletes material from Telegram & Supabase
        if (item.telegram_message_id) {
          await deleteFromTelegram(item.telegram_message_id);
        }
        await supabase.from("classwork").delete().eq("id", item.id);
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        showToast("Material permanently deleted.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-b-2xl border-x border-b border-gray-200 dark:border-gray-800 space-y-4 relative">
      
      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-gray-900/95 text-white border border-gray-700 shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      {isTeacher && (
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
              Course Material & Cloud Vault
            </h3>
            <p className="text-[11px] text-gray-500">Post study notes or assign homework with submissions.</p>
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
        {/* Upload Queue Tiles */}
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
                  onClick={() => setUploadQueue((prev) => prev.filter((i) => i.taskId !== uploadTask.taskId))}
                  className="text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-200 rounded-full ${
                  uploadTask.error ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-purple-600"
                }`}
                style={{ width: `${uploadTask.percentage}%` }}
              />
            </div>

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

        {/* Existing Materials List */}
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
          items.map((item) => {
            const studentSub = studentSubmissions[item.id];
            const isSubmitted = !!studentSub;
            const isGraded = studentSub && studentSub.grade && studentSub.grade !== "Ungraded";

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition flex flex-col gap-2.5"
              >
                {/* Main Card Info Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      item.type === "Notes" 
                        ? "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                    }`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {item.title}
                        </h4>
                        {/* Student Submission Badges */}
                        {!isTeacher && item.type === "Assignment" && (
                          isGraded ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 shrink-0">
                              ★ {studentSub.grade}
                            </span>
                          ) : isSubmitted ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                              ✓ Submitted
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 shrink-0">
                              Pending
                            </span>
                          )
                        )}
                      </div>

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

                  {/* Action Buttons Row */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Student Actions */}
                    {!isTeacher && item.type === "Assignment" && (
                      isSubmitted ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setActiveSubmissionAssignment(item)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold hover:bg-gray-300 transition"
                            title="Edit Submission"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleStudentUnsubmit(studentSub)}
                            className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                            title="Unsubmit / Delete Submission"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveSubmissionAssignment(item)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Turn In</span>
                        </button>
                      )
                    )}

                    {/* Teacher Actions */}
                    {isTeacher && item.type === "Assignment" && (
                      <button
                        onClick={() => setActiveGradingAssignment(item)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>Submissions</span>
                      </button>
                    )}

                    {/* Download */}
                    {item.file_url && (
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
                    )}

                    {/* Teacher Delete */}
                    {isTeacher && (
                      <button
                        onClick={() => promptDeleteMaterial(item)}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Student Feedback & Teacher Remarks Display Box */}
                {!isTeacher && isSubmitted && (
                  <div className="mt-1 p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-700/60 text-xs flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Your Submission: {studentSub.grade !== "Ungraded" ? `Graded (${studentSub.grade})` : "Turned in (Waiting for evaluation)"}
                      </span>
                      {studentSub.file_url && (
                        <a href={studentSub.file_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-[10px]">
                          View Submitted File
                        </a>
                      )}
                    </div>

                    {studentSub.feedback && (
                      <div className="mt-1 p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 text-[11px] flex items-start gap-1.5">
                       
<MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span><strong>Teacher's Feedback:</strong> {studentSub.feedback}</span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Upload Material Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              Upload Course Material
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Post notes or homework assignment[cite: 1].
            </p>

            <form onSubmit={handleStartMultiUpload} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Title (Optional for multiple files)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 3 Notes"
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
                  Select Files
                </label>
                <input
                  type="file"
                  multiple
                  required
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="w-full text-[11px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-200 hover:file:bg-gray-200"
                />
              </div>

              <button
                type="submit"
                disabled={selectedFiles.length === 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold shadow-md active:scale-95 transition mt-2"
              >
                <Layers className="w-4 h-4" />
                <span>Upload ({selectedFiles.length || 0})</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Unsubmit Center Confirmation Modal */}
      <CenterModal
        isOpen={deleteDialog.isOpen}
        type="danger"
        title={deleteDialog.isStudentUnsubmit ? "Unsubmit Homework?" : "Delete Material?"}
        message={
          deleteDialog.isStudentUnsubmit
            ? "Aapka submitted answer aur attached file remove ho jayegi. Aap dobara naya homework submit kar sakte hain."
            : `"${deleteDialog.item?.title}" permanently classroom aur Telegram vault se purge ho jayega.`
        }
        confirmText={deleteDialog.isStudentUnsubmit ? "Yes, Unsubmit" : "Yes, Delete"}
        cancelText="Cancel"
        onConfirm={executeConfirmedDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, item: null, isStudentUnsubmit: false })}
      />

      {/* Student Turn In & Edit Modal */}
      <SubmitAssignmentModal
        isOpen={!!activeSubmissionAssignment}
        assignment={activeSubmissionAssignment}
        existingSubmission={activeSubmissionAssignment ? studentSubmissions[activeSubmissionAssignment.id] : null}
        onClose={() => setActiveSubmissionAssignment(null)}
        onSubmissionSuccess={() => {
          showToast("Homework turned in successfully!");
          fetchStudentSubmissions();
        }}
      />

      {/* Teacher Grading Modal */}
      <TeacherGradingModal
        isOpen={!!activeGradingAssignment}
        assignment={activeGradingAssignment}
        onClose={() => {
          setActiveGradingAssignment(null);
          fetchClasswork();
        }}
      />
    </div>
  );
}