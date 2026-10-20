import React, { useState, useEffect } from "react";
import { X, UploadCloud, Loader2, CheckCircle2, FileText } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../services/supabaseClient";
import { uploadToTelegramWithProgress } from "../../../services/telegramStorage";

export default function SubmitAssignmentModal({ 
  isOpen, 
  onClose, 
  assignment, 
  existingSubmission, 
  onSubmissionSuccess 
}) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (existingSubmission) {
      setTextAnswer(existingSubmission.text_answer || "");
    } else {
      setTextAnswer("");
      setSelectedFile(null);
    }
    setErrorMsg("");
  }, [existingSubmission, isOpen]);

  if (!isOpen || !assignment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile && !textAnswer.trim() && !existingSubmission?.file_url) {
      setErrorMsg("Kripya answer likhein ya homework file attach karein.");
      return;
    }

    setUploading(true);
    setErrorMsg("");

    try {
      let fileUrl = existingSubmission?.file_url || "";
      if (selectedFile) {
        const uploaded = await uploadToTelegramWithProgress(selectedFile, (p) => {
          setProgress(p.percentage);
        });
        fileUrl = uploaded.fileUrl;
      }

      if (existingSubmission) {
        // Edit / Update existing submission
        const { error } = await supabase
          .from("assignment_submissions")
          .update({
            file_url: fileUrl,
            text_answer: textAnswer.trim(),
            submitted_at: new Date().toISOString(),
          })
          .eq("id", existingSubmission.id);

        if (error) throw error;
      } else {
        // Insert new submission
        const { error } = await supabase.from("assignment_submissions").insert([
          {
            classwork_id: assignment.id,
            class_id: assignment.class_id,
            student_id: user?.id || "usr_student",
            student_name: user?.name || "Student",
            file_url: fileUrl,
            text_answer: textAnswer.trim(),
            grade: "Ungraded",
          },
        ]);

        if (error) throw error;
      }

      onSubmissionSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Submission me problem aayi.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700 relative text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
          {existingSubmission ? "Edit Turned-In Assignment" : "Turn In Assignment"}
        </h3>
        <p className="text-gray-500 mb-4 truncate font-medium">
          {assignment.title}
        </p>

        {errorMsg && (
          <div className="p-2.5 mb-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[11px] font-medium border border-red-200 dark:border-red-900">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Written Answer / Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your explanation or answers here..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {existingSubmission?.file_url ? "Replace File (Optional)" : "Attach Homework File"}
            </label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-[11px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-200 hover:file:bg-gray-200"
            />
            {existingSubmission?.file_url && !selectedFile && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">
                ✓ Current file attached. Nayi file choose karne par replace ho jayegi.
              </span>
            )}
          </div>

          {uploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Saving to Telegram Vault...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold shadow-md active:scale-95 transition mt-2"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            <span>
              {uploading 
                ? "Submitting..." 
                : existingSubmission 
                ? "Update Submission" 
                : "Submit Homework"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}