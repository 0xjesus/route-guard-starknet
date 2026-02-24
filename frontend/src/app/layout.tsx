import type { Metadata } from "next";
import "./globals.css";
import { StarknetProvider } from "@/components/providers/StarknetProvider";

export const metadata: Metadata = {
  title: "RouteGuard - Anonymous Road Incident Reporting on Starknet",
  description: "Privacy-preserving road incident reporting powered by Starknet. Report anonymously, earn rewards.",
  keywords: ["starknet", "privacy", "road safety", "anonymous", "blockchain"],
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
