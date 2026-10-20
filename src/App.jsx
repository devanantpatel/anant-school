import React, { useState } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import AuthModal from "./components/common/AuthModal";
import CoffeeModal from "./components/common/CoffeeModal";

function MainApp() {
  const { user, isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState("student");
  const [isCoffeeOpen, setIsCoffeeOpen] = useState(false);
  const [activeClassroom, setActiveClassroom] = useState(null);

  const handleOpenAuth = (role = "student") => {
    setAuthRole(role);
    setIsAuthOpen(true);
  };

  const handleSelectClassroom = (classroom) => {
    setActiveClassroom(classroom);
  };

  // 1. Agar user kisi class ke andar hai
  if (isAuthenticated && activeClassroom) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-2">Classroom: {activeClassroom.title}</h2>
        <p className="text-gray-400 text-sm mb-6">Phase 3: Live Video Stage + WebRTC Grid + 3 Tabs coming next!</p>
        <button
          onClick={() => setActiveClassroom(null)}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // 2. Agar user authenticated hai -> Dashboard dikhao
  if (isAuthenticated && user) {
    return <DashboardPage onSelectClassroom={handleSelectClassroom} />;
  }

  // 3. Agar user logged out hai -> Landing Page dikhao
  return (
    <>
      <LandingPage
        onOpenAuth={handleOpenAuth}
        onOpenCoffee={() => setIsCoffeeOpen(true)}
      />
      <AuthModal
        isOpen={isAuthOpen}
        initialRole={authRole}
        onClose={() => setIsAuthOpen(false)}
      />
      <CoffeeModal
        isOpen={isCoffeeOpen}
        onClose={() => setIsCoffeeOpen(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}