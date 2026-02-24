"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, CheckCircle, Heart, Gift, Shield, Wallet } from "lucide-react";
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
            <Shield className="w-5 h-5 text-teal-400" />
            <span className="font-bold text-white">RouteGuard</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {count !== undefined && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 text-xs text-teal-400">
              <MapPin className="w-3 h-3" />
              {Number(count)} reports
            </div>
          )}

          {isConnected && address ? (
            <button
              onClick={() => disconnect()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm"
            >
              <div className="w-2 h-2 rounded-full bg-teal-500" />
              <span className="text-white/80">{shortenAddress(address)}</span>
            </button>
          ) : (
            <div className="flex gap-2">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 transition-colors text-sm text-teal-300"
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
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-semibold shadow-[0_0_30px_rgba(0,212,170,0.3)]"
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
