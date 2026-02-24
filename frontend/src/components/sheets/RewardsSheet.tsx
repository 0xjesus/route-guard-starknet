"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Gift, Loader2, Key, Shield, Fingerprint } from "lucide-react";
import { useClaimRewards, usePendingRewards } from "@/hooks/useRouteGuard";
import { useAccount } from "@starknet-react/core";
import { generateCommitment, generateNullifier } from "@/lib/pedersen";

interface RewardsSheetProps {
  onClose: () => void;
}

export default function RewardsSheet({ onClose }: RewardsSheetProps) {
  const { address } = useAccount();
  const [passphrase, setPassphrase] = useState("");
  const [commitment, setCommitment] = useState<string | undefined>();
  const { rewards, isLoading: loadingRewards, refetch } = usePendingRewards(commitment);
  const { claim, isPending } = useClaimRewards();
  const [success, setSuccess] = useState(false);

  const handleCheckRewards = () => {
    if (!passphrase) return;
    const { commitment: c } = generateCommitment(passphrase);
    setCommitment(c);
  };

  const handleClaim = async () => {
    if (!passphrase || !address) return;
    const { secret, salt } = generateCommitment(passphrase);
    // Generate nullifier = pedersen(secret, 0) for this claim
    const nullifier = generateNullifier(secret, "0");
    try {
      await claim(secret, salt, nullifier, address);
      setSuccess(true);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const rewardAmount = rewards ? Number(rewards) / 1e18 : 0;

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
            <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center">
              <Gift className="w-4 h-4 text-[#FF6B35]" />
            </div>
            <h2 className="text-lg font-bold text-white">Claim Rewards</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 rounded-full bg-[#7B3FE4]/20 flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-[#7B3FE4]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Rewards Claimed!</h3>
            <p className="text-sm text-white/50 mb-3">Rewards sent to your wallet via nullifier-protected claim.</p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7B3FE4]/10 border border-[#7B3FE4]/20">
              <Fingerprint className="w-3 h-3 text-[#7B3FE4]" />
              <span className="text-xs text-[#7B3FE4]">Nullifier prevents double-claim</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Privacy info */}
            <div className="p-3 rounded-xl bg-[#7B3FE4]/5 border border-[#7B3FE4]/15">
              <div className="flex items-center gap-2 mb-1">
                <Fingerprint className="w-3.5 h-3.5 text-[#7B3FE4]" />
                <span className="text-xs font-semibold text-[#7B3FE4]">NULLIFIER-PROTECTED CLAIM</span>
              </div>
              <p className="text-[11px] text-white/30">
                Your claim generates a unique nullifier = pedersen(secret, report_id). This prevents double-claims while keeping your identity unlinkable.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-[#7B3FE4]" />
                <span className="text-sm font-medium text-white/70">Enter your passphrase</span>
              </div>
              <p className="text-xs text-white/30 mb-3">
                The passphrase you saved when submitting your report
              </p>
              <input
                type="text"
                placeholder="alpha-bravo-carbon-delta"
                value={passphrase}
                onChange={(e) => { setPassphrase(e.target.value); setCommitment(undefined); }}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[#7B3FE4]/50 focus:outline-none font-mono"
              />
            </div>

            {!commitment && (
              <button
                onClick={handleCheckRewards}
                disabled={!passphrase}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors disabled:opacity-30"
              >
                Check Rewards
              </button>
            )}

            {commitment && (
              <div className="p-4 rounded-2xl bg-[#7B3FE4]/10 border border-[#7B3FE4]/20">
                <p className="text-sm text-white/50 mb-1">Pending Rewards</p>
                {loadingRewards ? (
                  <Loader2 className="w-5 h-5 text-[#7B3FE4] animate-spin" />
                ) : (
                  <p className="text-3xl font-bold text-[#7B3FE4]">
                    {rewardAmount.toFixed(6)} <span className="text-lg text-[#7B3FE4]/60">ETH</span>
                  </p>
                )}
              </div>
            )}

            {commitment && rewardAmount > 0 && (
              <button
                onClick={handleClaim}
                disabled={isPending || !address}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7B3FE4] to-[#4A3AFF] text-white font-semibold disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                {!address ? "Connect Wallet to Claim" : "Claim with Nullifier"}
              </button>
            )}

            {commitment && rewardAmount === 0 && !loadingRewards && (
              <p className="text-sm text-white/40 text-center">No pending rewards for this passphrase.</p>
            )}

            <p className="text-xs text-white/20 text-center flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              Your passphrase proves ownership without revealing identity
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
