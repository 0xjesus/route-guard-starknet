import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const EVENT_TYPES = [
  { id: 0, name: "Accident", icon: "🚗", color: "#ef4444", description: "Vehicle collision or accident" },
  { id: 1, name: "Road Closure", icon: "🚧", color: "#f59e0b", description: "Road closed or blocked" },
  { id: 2, name: "Protest", icon: "📢", color: "#8b5cf6", description: "Protest or demonstration" },
  { id: 3, name: "Police Activity", icon: "🚔", color: "#3b82f6", description: "Police checkpoint or activity" },
  { id: 4, name: "Hazard", icon: "⚠️", color: "#f97316", description: "Road hazard or danger" },
  { id: 5, name: "Traffic Jam", icon: "🚦", color: "#ec4899", description: "Heavy traffic congestion" },
] as const;

export const STATUS_LABELS = ["Active", "Confirmed", "Expired", "Slashed"] as const;

export function scaleCoord(coord: number): string {
  return Math.round(coord * 1e8).toString();
}

export function unscaleCoord(scaled: bigint | string): number {
  return Number(BigInt(scaled)) / 1e8;
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString();
}

export function timeAgo(ts: number): string {
  const seconds = Math.floor(Date.now() / 1000 - ts);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
