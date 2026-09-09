import type { Metadata, Viewport } from "next";
import { PlayerProvider } from "@/components/auth/player-context";
import "./globals.css";
export const metadata: Metadata = {
  icons: { apple: "/icons/icon-192.png" },
  title: "EastQuest — Your Campus. Your Quest.",
  description: "A student-built playable campus exploration prototype for EWU.",
};
export const viewport: Viewport = { themeColor: "#152c29" };
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
