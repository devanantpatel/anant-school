import React from "react";
import Navbar from "../components/common/Navbar";
import HeroBanner from "../components/landing/HeroBanner";
import HowItWorks from "../components/landing/HowItWorks";
import TrustShield from "../components/landing/TrustShield";
import FaqAccordion from "../components/landing/FaqAccordion";
import Footer from "../components/common/Footer";

export default function LandingPage({ onOpenAuth, onOpenCoffee }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors">
      <Navbar onLoginClick={() => onOpenAuth("student")} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <HeroBanner
          onTeacherClick={() => onOpenAuth("teacher")}
          onStudentClick={() => onOpenAuth("student")}
        />
        <HowItWorks />
        <TrustShield />
        <FaqAccordion />
      </main>

      <Footer onOpenCoffee={onOpenCoffee} />
    </div>
  );
}