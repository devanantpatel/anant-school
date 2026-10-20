import React, { useState, useEffect } from "react";
import { X, Plus, LogIn, Loader2, Palette } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { supabase } from "../../services/supabaseClient";

export default function CreateOrJoinModal({ 
  isOpen, 
  onClose, 
  onRefreshClasses, 
  editingClass = null 
}) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const isTeacher = user?.role === "teacher";

  // Form Fields
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [section, setSection] = useState("");
  const [description, setDescription] = useState("");
  const [colorTheme, setColorTheme] = useState("bg-gradient-to-r from-indigo-600 to-purple-600");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  const themeOptions = [
    { label: "Indigo Purple", class: "bg-gradient-to-r from-indigo-600 to-purple-600" },
    { label: "Ocean Blue", class: "bg-gradient-to-r from-blue-600 to-cyan-600" },
    { label: "Emerald Teal", class: "bg-gradient-to-r from-emerald-600 to-teal-700" },
    { label: "Sunset Orange", class: "bg-gradient-to-r from-amber-500 to-red-600" },
    { label: "Rose Crimson", class: "bg-gradient-to-r from-rose-600 to-pink-600" },
  ];

  // Prefill when editing
  useEffect(() => {
    if (editingClass) {
      setTitle(editingClass.title || "");
      setSubject(editingClass.subject || "");
      setSection(editingClass.section || "");
      setDescription(editingClass.description || "");
      setColorTheme(editingClass.color || themeOptions[0].class);
    } else {
      setTitle("");
      setSubject("");
      setSection("");
      setDescription("");
      setColorTheme(themeOptions[0].class);
      setJoinCode("");
    }
  }, [editingClass, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isTeacher) {
        if (!title.trim()) return;

        if (editingClass) {
          // Update existing class
          const { error } = await supabase
            .from("classes")
            .update({
              title: title.trim(),
              subject: subject.trim() || "General",
              section: section.trim(),
              description: description.trim(),
              color_theme: colorTheme,
            })
            .eq("id", editingClass.id);

          if (error) throw error;
        } else {
          // Insert new class
          const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          const newClassId = "cls_" + Date.now();

          const { error } = await supabase.from("classes").insert([
            {
              id: newClassId,
              title: title.trim(),
              subject: subject.trim() || "General",
              section: section.trim(),
              description: description.trim(),
              color_theme: colorTheme,
              code: generatedCode,
              teacher_id: user?.id || "usr_teacher",
              teacher_name: user?.name || "Instructor",
              students_count: 1,
              is_live: false,
              is_locked: false,
              current_stream_url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
              current_mode: "youtube",
            },
          ]);

          if (error) throw error;
        }

        onRefreshClasses();
        onClose();
      } else {
        // Student Join Class
        if (!joinCode.trim()) return;

        const { data, error } = await supabase
          .from("classes")
          .select("*")
          .eq("code", joinCode.trim().toUpperCase())
          .single();

        if (error || !data) {
          alert("Invalid Class Code! Please check with your teacher.");
          setLoading(false);
          return;
        }

        if (data.is_locked) {
          alert("🔒 This classroom is locked by the teacher. New joins are currently paused.");
          setLoading(false);
          return;
        }

        await supabase
          .from("classes")
          .update({ students_count: (data.students_count || 0) + 1 })
          .eq("id", data.id);

        onRefreshClasses();
        onClose();
      }
    } catch (err) {
      console.error("Database error:", err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {editingClass 
            ? (lang === "hi" ? "कक्षा एडिट करें" : "Edit Classroom Details")
            : isTeacher 
            ? (lang === "hi" ? "नई कक्षा बनाएं" : "Create New Class") 
            : (lang === "hi" ? "कक्षा में जुड़ें" : "Join a Class")}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          {isTeacher
            ? "Configure classroom metadata, banners, and topic information."
            : "Enter the 6-character code provided by your educator."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isTeacher ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics - Grade 10"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Geometry"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Section / Batch
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Batch A"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Short syllabus overview or schedule details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Theme Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Banner Card Theme</span>
                </label>
                <div className="flex items-center gap-2">
                  {themeOptions.map((th, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setColorTheme(th.class)}
                      className={`h-7 w-7 rounded-xl ${th.class} transition ${
                        colorTheme === th.class ? "ring-2 ring-indigo-500 scale-110" : "opacity-80"
                      }`}
                      title={th.label}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Class Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="e.g. 7X9K2P"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-center tracking-widest font-mono text-base uppercase rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md active:scale-95 transition mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : editingClass ? (
              <span>Save Changes</span>
            ) : isTeacher ? (
              <Plus className="w-4 h-4" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>
              {loading
                ? "Saving..."
                : editingClass
                ? ""
                : isTeacher
                ? "Create Classroom"
                : "Join Classroom"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}