"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, MapPin, Users, Coins, Zap, ChevronRight, Lock, Eye, EyeOff, Fingerprint, Radio } from "lucide-react";
import { useReportCount } from "@/hooks/useRouteGuard";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const features = [
  {
    icon: Lock,
    title: "Pedersen Commitments",
    description: "Native STARK-friendly hashing ensures your identity is cryptographically hidden on-chain",
    color: "#7B3FE4",
  },
  {
    icon: EyeOff,
    title: "Relayer Architecture",
    description: "Transactions submitted via relayer — your wallet never touches the chain",
    color: "#4A3AFF",
  },
  {
    icon: Fingerprint,
    title: "Nullifier System",
    description: "Claim rewards without correlation — each claim uses a unique nullifier",
    color: "#00d4aa",
  },
  {
    icon: Coins,
    title: "Anonymous Rewards",
    description: "Earn rewards for verified reports, claimable to any address you choose",
    color: "#FF6B35",
  },
];

const steps = [
  { icon: MapPin, title: "Report", desc: "Tap the map to report an incident — no wallet connection needed", color: "#7B3FE4" },
  { icon: Users, title: "Verify", desc: "Community validates reports for accuracy and trust", color: "#4A3AFF" },
  { icon: Coins, title: "Earn", desc: "Claim rewards with your secret passphrase via nullifier", color: "#00d4aa" },
];

const privacyLayers = [
  {
    icon: "🔐",
    title: "Your wallet NEVER appears on-chain",
    description: "The relayer submits transactions on your behalf. Your address is never linked to any report.",
  },
  {
    icon: "🧮",
    title: "Pedersen commitment hides your identity",
    description: "commitment = pedersen(secret, salt) — collision-resistant and native to Starknet's STARK proofs.",
  },
  {
    icon: "🚫",
    title: "Nullifiers prevent correlation",
    description: "Each reward claim uses nullifier = pedersen(secret, report_id). No two claims can be linked.",
  },
  {
    icon: "📡",
    title: "Relayer submits transactions for you",
    description: "The relayer API strips all identifying metadata. Only the commitment reaches the blockchain.",
  },
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
      {/* Gradient orbs — Starknet colors */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7B3FE4]/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#29296E]/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-[#FF6B35]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B3FE4] to-[#4A3AFF] flex items-center justify-center shadow-[0_0_20px_rgba(123,63,228,0.3)]">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white">RouteGuard</span>
            <span className="text-[10px] text-white/30 -mt-1 tracking-wider">BUILT ON STARKNET</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7B3FE4]/10 border border-[#7B3FE4]/20">
            <div className="w-2 h-2 rounded-full bg-[#7B3FE4] animate-pulse" />
            <span className="text-xs font-medium text-[#7B3FE4]">Starknet</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-8">
        {/* Hackathon Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#7B3FE4]/10 to-[#29296E]/10 border border-[#7B3FE4]/30 mb-6 glow-starknet"
        >
          <Eye className="w-4 h-4 text-[#7B3FE4]" />
          <span className="text-sm font-semibold text-[#7B3FE4]">Re&#123;define&#125; Hackathon 2026</span>
          <span className="text-xs text-white/30">•</span>
          <span className="text-sm text-[#FF6B35] font-medium">Privacy Track</span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 leading-tight">
            <span className="text-white">STARK-Powered</span>
            <br />
            <span className="starknet-gradient-text">
              Anonymous Road Safety
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            Report road incidents without exposing your identity. Protected by Starknet&apos;s native Pedersen commitments, nullifier-based claims, and a privacy-preserving relayer.
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
                      ? "bg-white/10 border border-[#7B3FE4]/50 shadow-[0_0_20px_rgba(123,63,228,0.2)]"
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
          className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-[#7B3FE4] to-[#4A3AFF] text-white font-bold text-lg flex items-center gap-3 shadow-[0_0_40px_rgba(123,63,228,0.3)] hover:shadow-[0_0_60px_rgba(123,63,228,0.5)] transition-shadow"
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
            <Shield className="w-4 h-4 text-[#7B3FE4]" />
            <span>{Number(count)} anonymous reports on-chain</span>
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
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-[#7B3FE4]/30 transition-colors group"
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

        {/* ═══ Privacy Architecture Section ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-20 w-full max-w-4xl"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7B3FE4]/10 border border-[#7B3FE4]/20 mb-4">
              <Shield className="w-4 h-4 text-[#7B3FE4]" />
              <span className="text-sm font-semibold text-[#7B3FE4]">Privacy Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              How STARKs Protect Your Identity
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto">
              Four layers of privacy ensure your identity is never compromised — from the moment you report to the moment you claim rewards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {privacyLayers.map((layer, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + i * 0.1 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-[#7B3FE4]/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{layer.icon}</span>
                  <div>
                    <h3 className="text-white font-semibold mb-1.5">{layer.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{layer.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Architecture flow diagram */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-8 p-6 rounded-2xl bg-[#29296E]/10 border border-[#29296E]/20 font-mono text-xs sm:text-sm text-white/50 overflow-x-auto"
          >
            <div className="text-center text-[#7B3FE4] font-semibold mb-3 font-sans text-base">On-Chain Data Flow</div>
            <pre className="text-center leading-relaxed whitespace-pre">{`
  📱 Reporter                    🔀 Relayer                    ⛓️ Starknet
  ──────────                    ────────                    ────────
  passphrase                      │                            │
      │                           │                            │
      ▼                           │                            │
  secret = keccak(phrase)         │                            │
  salt   = keccak(phrase+"_salt") │                            │
      │                           │                            │
      ▼                           │                            │
  commitment = pedersen(s, salt)──▶  POST /api/relay ──────────▶  submit_report(
      │                              (strips identity)            commitment,
      │                                                           lat, lng, type)
      │                                                              │
      ▼                                                              ▼
  🔑 Save passphrase             ❌ No wallet link            📦 Stored: commitment
  (claim rewards later)             on-chain                      (not identity)
            `}</pre>
          </motion.div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-12 flex flex-wrap justify-center gap-4 text-xs text-white/30"
        >
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#7B3FE4]" />
            Starknet Sepolia
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4A3AFF]" />
            Pedersen Commitments
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]" />
            Nullifier System
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
            STARK Proofs
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Open Source
          </span>
        </motion.div>

        {/* Built on Starknet footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
          className="mt-8 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#29296E]/10 border border-[#29296E]/20"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B3FE4] to-[#29296E] flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/80">Built on Starknet</p>
            <p className="text-xs text-white/30">Native Pedersen hash • STARK validity proofs • Account abstraction</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
