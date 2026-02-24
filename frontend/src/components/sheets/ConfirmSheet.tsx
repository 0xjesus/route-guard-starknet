"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle, Loader2, Heart } from "lucide-react";
import { useConfirmReport, useSendRegards, useReport } from "@/hooks/useRouteGuard";
import { EVENT_TYPES, STATUS_LABELS, unscaleCoord, timeAgo } from "@/lib/utils";

interface ConfirmSheetProps {
  onClose: () => void;
}

export default function ConfirmSheet({ onClose }: ConfirmSheetProps) {
  const [reportIdInput, setReportIdInput] = useState("");
  const [regardsAmount, setRegardsAmount] = useState("");
  const { confirm, isPending: isConfirming } = useConfirmReport();
  const { sendRegards, isPending: isSending } = useSendRegards();

  const reportId = reportIdInput ? BigInt(reportIdInput) : undefined;
  const { report, isLoading } = useReport(reportId);

  const handleConfirm = async () => {
    if (!reportId) return;
    try {
      await confirm(reportId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendRegards = async () => {
    if (!reportId || !regardsAmount) return;
    try {
      const amount = BigInt(Math.round(parseFloat(regardsAmount) * 1e18));
      await sendRegards(reportId, amount);
    } catch (err) {
      console.error(err);
    }
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
        className="w-full max-w-lg bg-[#111111] rounded-t-3xl sm:rounded-3xl border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Validate & Reward</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="number"
            placeholder="Enter Report ID"
            value={reportIdInput}
            onChange={(e) => setReportIdInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-teal-500/50 focus:outline-none"
          />

          {isLoading && reportId !== undefined && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
            </div>
          )}

          {report && (report as any).timestamp > 0 && (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{EVENT_TYPES[(report as any).event_type?.variant ? 0 : 0]?.icon || "📍"}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-teal-500/10 text-teal-300">
                  {STATUS_LABELS[0]}
                </span>
              </div>
              <p className="text-sm text-white/50">
                Confirmations: <span className="text-white">{String((report as any).confirmations || 0)}</span>
              </p>
              <p className="text-sm text-white/50">
                Submitted: <span className="text-white">{timeAgo(Number((report as any).timestamp || 0))}</span>
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={!reportId || isConfirming}
              className="flex-1 py-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 font-semibold disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Confirm
            </button>
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="text-sm text-white/50 mb-3">Send Regards (ETH)</p>
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="0.001"
                value={regardsAmount}
                onChange={(e) => setRegardsAmount(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-teal-500/50 focus:outline-none"
                step="0.001"
              />
              <button
                onClick={handleSendRegards}
                disabled={!reportId || !regardsAmount || isSending}
                className="px-5 py-3 rounded-xl bg-pink-500/20 border border-pink-500/30 text-pink-300 font-semibold disabled:opacity-30 flex items-center gap-2"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
                Send
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
