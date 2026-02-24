"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, MapPin, Users, Coins, Zap, ChevronRight, Lock, Eye } from "lucide-react";
import { useReportCount } from "@/hooks/useRouteGuard";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const features = [
  {
    icon: Lock,
    title: "Anonymous Reports",
    description: "Pedersen commitments ensure your identity is never linked to reports",
    color: "#00d4aa",
  },
  {
    icon: Shield,
    title: "Relayer Privacy",
    description: "Transactions submitted via relayer — no wallet connection needed to report",
    color: "#0ea5e9",
  },
  {
    icon: Users,
    title: "Community Validated",
    description: "Reports are confirmed by the community for accuracy and trust",
    color: "#8b5cf6",
  },
  {
    icon: Coins,
    title: "Earn Rewards",
    description: "Get rewarded for verified reports with on-chain regards",
    color: "#f59e0b",
  },
];

const steps = [
  { icon: MapPin, title: "Report", desc: "Tap map to report an incident anonymously", color: "#ef4444" },
  { icon: Users, title: "Verify", desc: "Community confirms reports for accuracy", color: "#3b82f6" },
  { icon: Coins, title: "Earn", desc: "Claim rewards using your secret passphrase", color: "#00d4aa" },
];

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const { count } = useReportCount();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActiveStep((p) => (p + 1) % 3), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col carbon-bg overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold text-white">RouteGuard</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-xs font-medium text-teal-400">Starknet</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6"
        >
          <Eye className="w-4 h-4 text-teal-400" />
          <span className="text-sm text-teal-300">Re&#123;define&#125; Hackathon 2026 — Privacy Track</span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 leading-tight">
            <span className="text-white">Road Safety,</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              Truly Anonymous
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-lg mx-auto">
            Report road incidents without exposing your identity. Powered by Starknet&apos;s Pedersen commitments and relayer architecture.
          </p>
        </motion.div>

        {/* How it works steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-xl mb-8"
        >
          <div className="flex justify-center gap-4 sm:gap-8 mb-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = activeStep === i;
              return (
                <motion.button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center p-3 sm:p-4 rounded-2xl transition-all ${
                    isActive
                      ? "bg-white/10 border border-teal-500/50 shadow-[0_0_20px_rgba(0,212,170,0.2)]"
                      : "bg-white/5 border border-transparent"
                  }`}
                >
                  <div
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-2"
                    style={{ backgroundColor: isActive ? step.color + "30" : "rgba(255,255,255,0.05)" }}
                  >
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: isActive ? step.color : "#666" }} />
                  </div>
                  <span className={`text-sm font-semibold ${isActive ? "text-white" : "text-white/40"}`}>
                    {step.title}
                  </span>
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={activeStep}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-white/60 text-center"
            >
              {steps[activeStep].desc}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onGetStarted}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-bold text-lg flex items-center gap-3 shadow-[0_0_40px_rgba(0,212,170,0.3)] hover:shadow-[0_0_60px_rgba(0,212,170,0.5)] transition-shadow"
        >
          <Zap className="w-5 h-5" />
          Launch Dashboard
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        {/* Live stats */}
        {count && Number(count) > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-sm text-white/50"
          >
            <Shield className="w-4 h-4 text-teal-400" />
            <span>{Number(count)} reports on-chain</span>
          </motion.div>
        )}

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-teal-500/30 transition-colors group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: f.color + "15" }}
                >
                  <Icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="text-white font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-white/40">{f.description}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-white/30"
        >
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            Starknet Sepolia
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            Pedersen Commitments
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Privacy-First
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Open Source
          </span>
        </motion.div>
      </main>
    </div>
  );
}
