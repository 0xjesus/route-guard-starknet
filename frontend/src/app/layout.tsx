import type { Metadata } from "next";
import "./globals.css";
import { StarknetProvider } from "@/components/providers/StarknetProvider";

export const metadata: Metadata = {
  title: "RouteGuard — STARK-Powered Anonymous Road Safety | Re{define} Hackathon 2026",
  description: "Privacy-preserving road incident reporting built on Starknet. Pedersen commitments, nullifier-based claims, and relayer architecture protect your identity. Re{define} Hackathon 2026 Privacy Track.",
  keywords: ["starknet", "privacy", "road safety", "anonymous", "blockchain", "STARK", "pedersen", "zero-knowledge", "redefine hackathon"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0a] antialiased">
        <StarknetProvider>
          {children}
        </StarknetProvider>
      </body>
    </html>
  );
}
