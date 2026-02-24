"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeroSection from "@/components/landing/HeroSection";
import Dashboard from "@/components/dashboard/Dashboard";

type AppView = "landing" | "dashboard";

export default function Home() {
  const [view, setView] = useState<AppView>("landing");

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <AnimatePresence mode="wait">
        {view === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HeroSection onGetStarted={() => setView("dashboard")} />
          </motion.div>
        )}
        {view === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard onBack={() => setView("landing")} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
