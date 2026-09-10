"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/components/auth/player-context";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="EastQuest home">
      <span className="brand-mark">
        E<span>Q</span>
      </span>
      <span>
        EAST<span className="gold">QUEST</span>
      </span>
    </Link>
  );
}
export function Disclaimer() {
  return (
    <p className="disclaimer">
      Student-built prototype. Not an official East West University service.
    </p>
  );
}
export function PageHeader() {
  return (
    <header className="page-header">
      <Brand />
      <nav>
        <Link href="/game">Campus</Link>
        <Link href="/collection">Collection</Link>
        <Link href="/activities">Activities</Link>
        <Link href="/cases">Cases</Link>
        <Link href="/profile">Profile</Link>
      </nav>
    </header>
  );
}
export function PlayerGuard({ children }: { children: React.ReactNode }) {
  const { save, ready, error } = usePlayer();
  const router = useRouter();
  useEffect(() => {
    if (ready && !save) router.replace("/login");
  }, [ready, save, router]);
  if (!ready || !save)
    return (
      <main className="loading">
        <span className="eyebrow">EASTQUEST</span>
        <p>{error || "Preparing your campus…"}</p>
        <Link href="/login">Go to prototype login</Link>
      </main>
    );
  return children;
}
