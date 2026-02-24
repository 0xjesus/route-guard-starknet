"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, MapPin, Send, Copy, Check, AlertTriangle, Loader2, Shield } from "lucide-react";
import { EVENT_TYPES, scaleCoord } from "@/lib/utils";
import { generatePassphrase, generateCommitment } from "@/lib/pedersen";

interface ReportSheetProps {
  onClose: () => void;
  initialLocation: { lat: number; lng: number } | null;
}

export default function ReportSheet({ onClose, initialLocation }: ReportSheetProps) {
  const [step, setStep] = useState<"type" | "location" | "passphrase" | "submitting" | "done">("type");
  const [eventType, setEventType] = useState<number>(0);
  const [lat, setLat] = useState(initialLocation?.lat.toString() || "");
  const [lng, setLng] = useState(initialLocation?.lng.toString() || "");
  const [passphrase, setPassphrase] = useState("");
  const [commitment, setCommitment] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  const handleGeneratePassphrase = () => {
    const phrase = generatePassphrase(4);
    setPassphrase(phrase);
    const { commitment: c } = generateCommitment(phrase);
    setCommitment(c);
  };

  const handleSubmit = async () => {
    if (!passphrase || !lat || !lng) {
      setError("Please fill all fields");
      return;
    }
    setStep("submitting");
    setError("");

    try {
      const { commitment: c } = generateCommitment(passphrase);
      const res = await fetch("/api/relay/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commitment: c,
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          eventType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setTxHash(data.txHash || "");
      setStep("done");
    } catch (err: any) {
      setError(err.message);
      setStep("passphrase");
    }
  };

  const copyPassphrase = () => {
    navigator.clipboard.writeText(passphrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#111111] rounded-t-3xl sm:rounded-3xl border border-white/10 p-6 max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-teal-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Report Incident</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {/* Step: Event Type */}
        {step === "type" && (
          <div className="space-y-4">
            <p className="text-sm text-white/50">What type of incident?</p>
            <div className="grid grid-cols-2 gap-3">
              {EVENT_TYPES.map((et) => (
                <button
                  key={et.id}
                  onClick={() => setEventType(et.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    eventType === et.id
                      ? "border-teal-500/50 bg-teal-500/10"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="text-2xl">{et.icon}</span>
                  <p className="text-sm font-medium text-white mt-1">{et.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">{et.description}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(initialLocation ? "passphrase" : "location")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-semibold"
            >
              Next
            </button>
          </div>
        )}

        {/* Step: Location */}
        {step === "location" && (
          <div className="space-y-4">
            <p className="text-sm text-white/50">Enter coordinates (or tap the map)</p>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Latitude (e.g., 19.4326)"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-teal-500/50 focus:outline-none"
                step="any"
              />
              <input
                type="number"
                placeholder="Longitude (e.g., -99.1332)"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-teal-500/50 focus:outline-none"
                step="any"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep("type")} className="flex-1 py-3 rounded-xl bg-white/5 text-white/70 font-medium">
                Back
              </button>
              <button
                onClick={() => setStep("passphrase")}
                disabled={!lat || !lng}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-semibold disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step: Passphrase */}
        {step === "passphrase" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-300">Save your passphrase!</span>
              </div>
              <p className="text-xs text-amber-200/60">
                This passphrase is the ONLY way to claim rewards later. Store it safely. It&apos;s never sent to the blockchain.
              </p>
            </div>

            {!passphrase ? (
              <button
                onClick={handleGeneratePassphrase}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
              >
                🎲 Generate Secure Passphrase
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-teal-400 font-medium">YOUR PASSPHRASE</span>
                    <button onClick={copyPassphrase} className="flex items-center gap-1 text-xs text-teal-300">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-lg font-mono text-white font-bold tracking-wide">{passphrase}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs text-white/30 font-medium">COMMITMENT (ON-CHAIN)</span>
                  <p className="text-xs font-mono text-white/50 mt-1 break-all">{commitment}</p>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep("type")} className="flex-1 py-3 rounded-xl bg-white/5 text-white/70 font-medium">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!passphrase}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-semibold disabled:opacity-30 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Anonymously
              </button>
            </div>

            <p className="text-xs text-white/20 text-center flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              Submitted via relayer — your wallet is never linked
            </p>
          </div>
        )}

        {/* Step: Submitting */}
        {step === "submitting" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-teal-400 animate-spin mb-4" />
            <p className="text-white/80 font-medium">Submitting via relayer...</p>
            <p className="text-sm text-white/40 mt-1">Your identity remains hidden</p>
          </div>
        )}

        {/* Step: Done */}
        {step === "done" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Report Submitted!</h3>
            <p className="text-sm text-white/50 mb-4 text-center">
              Your anonymous report is now on Starknet. Keep your passphrase to claim rewards.
            </p>
            {txHash && (
              <a
                href={`https://sepolia.starkscan.co/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-teal-400 underline mb-4"
              >
                View on StarkScan ↗
              </a>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
