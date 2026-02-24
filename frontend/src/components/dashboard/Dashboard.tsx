"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, CheckCircle, Heart, Gift, Shield, Wallet, Lock } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useReportCount } from "@/hooks/useRouteGuard";
import { shortenAddress } from "@/lib/utils";
import GoogleMapView from "@/components/map/GoogleMapView";
import ReportSheet from "@/components/sheets/ReportSheet";
import ConfirmSheet from "@/components/sheets/ConfirmSheet";
import RewardsSheet from "@/components/sheets/RewardsSheet";

interface DashboardProps {
  onBack: () => void;
}

type SheetView = "none" | "report" | "confirm" | "rewards";

export default function Dashboard({ onBack }: DashboardProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { count } = useReportCount();
  const [sheet, setSheet] = useState<SheetView>("none");
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setSheet("report");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] carbon-bg flex flex-col">
      {/* Top bar */}
      <header className="relative z-20 p-3 sm:p-4 flex items-center justify-between glass border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#7B3FE4] to-[#4A3AFF] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">RouteGuard</span>
          </div>
          {/* Privacy Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7B3FE4]/10 border border-[#7B3FE4]/20">
            <Lock className="w-3 h-3 text-[#7B3FE4]" />
            <span className="text-[10px] font-semibold text-[#7B3FE4] tracking-wider">STARK PRIVACY</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {count !== undefined && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#7B3FE4]/10 text-xs text-[#7B3FE4]">
              <MapPin className="w-3 h-3" />
              {Number(count)} reports
            </div>
          )}

          {isConnected && address ? (
            <button
              onClick={() => disconnect()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm"
            >
              <div className="w-2 h-2 rounded-full bg-[#7B3FE4]" />
              <span className="text-white/80">{shortenAddress(address)}</span>
            </button>
          ) : (
            <div className="flex gap-2">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#7B3FE4]/20 hover:bg-[#7B3FE4]/30 border border-[#7B3FE4]/30 transition-colors text-sm text-[#7B3FE4]"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">{connector.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <GoogleMapView onMapClick={handleMapClick} />

        {/* Floating action buttons */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSheet("report")}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#7B3FE4] to-[#4A3AFF] text-white font-semibold shadow-[0_0_30px_rgba(123,63,228,0.3)]"
          >
            <MapPin className="w-5 h-5" />
            Report
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSheet("confirm")}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold backdrop-blur-sm"
          >
            <CheckCircle className="w-5 h-5" />
            Validate
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSheet("rewards")}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold backdrop-blur-sm"
          >
            <Gift className="w-5 h-5" />
            Rewards
          </motion.button>
        </div>
      </div>

      {/* Sheets */}
      <AnimatePresence>
        {sheet === "report" && (
          <ReportSheet
            onClose={() => { setSheet("none"); setSelectedLocation(null); }}
            initialLocation={selectedLocation}
          />
        )}
        {sheet === "confirm" && <ConfirmSheet onClose={() => setSheet("none")} />}
        {sheet === "rewards" && <RewardsSheet onClose={() => setSheet("none")} />}
      </AnimatePresence>
    </div>
  );
}
