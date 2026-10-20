import React, { useState } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DrawerMenu from "../components/dashboard/DrawerMenu";
import ClassCard from "../components/dashboard/ClassCard";
import CreateOrJoinModal from "../components/dashboard/CreateOrJoinModal";
import { useAuth } from "../context/AuthContext";
import { BookOpen, Sparkles } from "lucide-react";

export default function DashboardPage({ onSelectClassroom }) {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  // Sample initial classrooms
  const [classes, setClasses] = useState([
    {
      id: "cls_1",
      title: "Science & Physics 101",
      subject: "Mechanics & Optics",
      code: "PH781A",
      studentsCount: 14,
      isLive: true,
      color: "bg-gradient-to-r from-blue-600 to-indigo-700",
    },
    {
      id: "cls_2",
      title: "Web Development Bootcamp",
      subject: "React & Architecture",
      code: "WEB99X",
      studentsCount: 22,
      isLive: false,
      color: "bg-gradient-to-r from-emerald-600 to-teal-700",
    },
  ]);

  const handleCreateClass = (newClass) => {
    setClasses((prev) => [newClass, ...prev]);
  };

  const handleJoinClass = (code) => {
    alert(`Enrolled into class code: ${code}!`);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
      <DashboardHeader
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenAddClass={() => setIsModalOpen(true)}
      />

      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Welcome Banner */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 shadow-sm">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Welcome back, {user?.name}! 👋
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {user?.role === "teacher" 
                ? "Manage your active classrooms, launch live streams, and grade assignments."
                : "Explore your enrolled classes, join live sessions, and submit homework."}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            {classes.length} Active Classes
          </span>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls) => (
            <ClassCard
              key={cls.id}
              classroom={cls}
              onEnterClass={onSelectClassroom}
            />
          ))}
        </div>
      </main>

      <CreateOrJoinModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateClass={handleCreateClass}
        onJoinClass={handleJoinClass}
      />
    </div>
  );
}