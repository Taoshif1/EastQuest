import type { Metadata } from "next";
import { PlayerProvider } from "@/components/auth/player-context";
import "./globals.css";
export const metadata: Metadata = {
  title: "EastQuest — Your Campus. Your Quest.",
  description: "A student-built playable campus exploration prototype for EWU.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PlayerProvider>{children}</PlayerProvider>
      </body>
    </html>
  );
}
