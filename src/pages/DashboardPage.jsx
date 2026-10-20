import React, { useState, useEffect } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DrawerMenu from "../components/dashboard/DrawerMenu";
import ClassCard from "../components/dashboard/ClassCard";
import CreateOrJoinModal from "../components/dashboard/CreateOrJoinModal";
import CenterModal from "../components/common/CenterModal";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { Sparkles, Loader2, BookOpen } from "lucide-react";

export default function DashboardPage({ onSelectClassroom }) {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Center Dialog State
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setClasses(data);
      }
    } catch (err) {
      console.error("Failed to load classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();

    const channel = supabase
      .channel("classes_realtime_feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "classes" },
        () => {
          loadClasses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Custom Center Delete Modal Trigger
  const handleDeleteClass = (classId) => {
    setDialogState({
      isOpen: true,
      type: "danger",
      title: "Delete Classroom?",
      message: "Are you sure you want to permanently delete this classroom? All associated lectures and messages will be removed.",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        closeDialog();
        try {
          const { error } = await supabase.from("classes").delete().eq("id", classId);
          if (error) throw error;
          setClasses((prev) => prev.filter((c) => c.id !== classId));
        } catch (err) {
          console.error("Delete failed:", err);
        }
      },
    });
  };

  // Toggle Lock/Unlock Handler
  const handleToggleLock = async (classroom) => {
    try {
      const nextLockState = !classroom.is_locked;
      const { error } = await supabase
        .from("classes")
        .update({ is_locked: nextLockState })
        .eq("id", classroom.id);

      if (error) throw error;
      setClasses((prev) =>
        prev.map((c) => (c.id === classroom.id ? { ...c, is_locked: nextLockState } : c))
      );
    } catch (err) {
      console.error("Lock toggle failed:", err);
    }
  };

  // Open Edit Modal
  const handleEditClass = (classroom) => {
    setEditingClass(classroom);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
      <DashboardHeader
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenAddClass={() => {
          setEditingClass(null);
          setIsModalOpen(true);
        }}
      />

      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-sm">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Welcome back, {user?.name}! 👋
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {user?.role === "teacher" 
                ? "Manage your active classrooms, customize themes, and control class security."
                : "Explore your enrolled classes, join live sessions, and submit homework."}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            {classes.length} Active Classes
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
            <span className="text-xs">Fetching active classrooms...</span>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">No classes created yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
              {user?.role === "teacher"
                ? "Click '+ Create Class' at the top to initialize your first live virtual room."
                : "Ask your educator for the 6-digit class code to join."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((cls) => (
              <ClassCard
                key={cls.id}
                classroom={{
                  id: cls.id,
                  title: cls.title,
                  subject: cls.subject,
                  section: cls.section,
                  description: cls.description,
                  code: cls.code,
                  studentsCount: cls.students_count || 1,
                  isLive: cls.is_live,
                  isLocked: cls.is_locked,
                  color: cls.color_theme || "bg-gradient-to-r from-indigo-600 to-purple-600",
                }}
                onEnterClass={onSelectClassroom}
                onEditClass={handleEditClass}
                onDeleteClass={handleDeleteClass}
                onToggleLock={handleToggleLock}
              />
            ))}
          </div>
        )}
      </main>

      {/* Classroom Creation/Edit Modal */}
      <CreateOrJoinModal
        isOpen={isModalOpen}
        editingClass={editingClass}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClass(null);
        }}
        onRefreshClasses={loadClasses}
      />

      {/* Modern Center Screen Confirmation Modal */}
      <CenterModal
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        onConfirm={dialogState.onConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}