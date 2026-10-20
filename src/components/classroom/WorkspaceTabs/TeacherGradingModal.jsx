import React, { useState, useEffect } from "react";
import { X, ExternalLink, Award, Loader2, Check, MessageSquare } from "lucide-react";
import { supabase } from "../../../services/supabaseClient";

export default function TeacherGradingModal({ isOpen, onClose, assignment }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradesInput, setGradesInput] = useState({});
  const [savedStatus, setSavedStatus] = useState({});

  useEffect(() => {
    if (!isOpen || !assignment) return;

    const fetchSubmissions = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("assignment_submissions")
        .select("*")
        .eq("classwork_id", assignment.id)
        .order("submitted_at", { ascending: false });

      if (data) {
        setSubmissions(data);
        const map = {};
        data.forEach((s) => {
          map[s.id] = { grade: s.grade || "", feedback: s.feedback || "" };
        });
        setGradesInput(map);
      }
      setLoading(false);
    };

    fetchSubmissions();
  }, [isOpen, assignment]);

  if (!isOpen || !assignment) return null;

  const handleSaveGrade = async (submissionId) => {
    const target = gradesInput[submissionId];

    setSavedStatus((prev) => ({ ...prev, [submissionId]: "saving" }));

    const { error } = await supabase
      .from("assignment_submissions")
      .update({
        grade: target.grade || "Graded",
        feedback: target.feedback || "",
      })
      .eq("id", submissionId);

    if (!error) {
      setSavedStatus((prev) => ({ ...prev, [submissionId]: "saved" }));
      setTimeout(() => {
        setSavedStatus((prev) => ({ ...prev, [submissionId]: null }));
      }, 2000);
    } else {
      setSavedStatus((prev) => ({ ...prev, [submissionId]: "error" }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700 relative max-h-[85vh] flex flex-col text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5">
          Student Submissions Review
        </h3>
        <p className="text-gray-500 mb-4">{assignment.title}</p>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Loading student papers...</span>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              Kisi student ne abhi tak homework turn in nahi kiya hai.
            </div>
          ) : (
            submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-gray-800 dark:text-gray-200">{sub.student_name}</h5>
                    <span className="text-[10px] text-gray-400">
                      Submitted: {new Date(sub.submitted_at).toLocaleDateString()} {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {sub.file_url && (
                    <a
                      href={sub.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-[10px] hover:bg-indigo-100 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Check File</span>
                    </a>
                  )}
                </div>

                {sub.text_answer && (
                  <div className="text-gray-700 dark:text-gray-300 p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60 text-[11px] leading-relaxed">
                    <span className="text-gray-400 block text-[9px] uppercase font-bold mb-0.5">Written Answer:</span>
                    "{sub.text_answer}"
                  </div>
                )}

                {/* Grading Inputs */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-gray-200/60 dark:border-gray-800">
                  <input
                    type="text"
                    placeholder="Marks (e.g. 9/10)"
                    value={gradesInput[sub.id]?.grade || ""}
                    onChange={(e) =>
                      setGradesInput((prev) => ({
                        ...prev,
                        [sub.id]: { ...prev[sub.id], grade: e.target.value },
                      }))
                    }
                    className="w-full sm:w-28 px-2.5 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none"
                  />

                  <input
                    type="text"
                    placeholder="Teacher feedback..."
                    value={gradesInput[sub.id]?.feedback || ""}
                    onChange={(e) =>
                      setGradesInput((prev) => ({
                        ...prev,
                        [sub.id]: { ...prev[sub.id], feedback: e.target.value },
                      }))
                    }
                    className="w-full sm:flex-1 px-2.5 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none"
                  />

                  <button
                    onClick={() => handleSaveGrade(sub.id)}
                    disabled={savedStatus[sub.id] === "saving"}
                    className={`w-full sm:w-auto px-4 py-1.5 rounded-xl font-semibold transition active:scale-95 flex items-center justify-center gap-1 ${
                      savedStatus[sub.id] === "saved"
                        ? "bg-emerald-600 text-white"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {savedStatus[sub.id] === "saving" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : savedStatus[sub.id] === "saved" ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <span>Save Grade</span>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}