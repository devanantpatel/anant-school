import React, { useState } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import ClassroomPage from "./pages/ClassroomPage";
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

  // 1. Live Interactive Classroom Room
  if (isAuthenticated && activeClassroom) {
    return (
      <ClassroomPage
        classroom={activeClassroom}
        onBack={() => setActiveClassroom(null)}
      />
    );
  }

  // 2. Dashboard Workspace
  if (isAuthenticated && user) {
    return <DashboardPage onSelectClassroom={(cls) => setActiveClassroom(cls)} />;
  }

  // 3. Public Landing Page
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