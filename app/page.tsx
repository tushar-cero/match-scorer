"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTournamentStore } from "@/stores/tournament-store";
import { useMatchStore } from "@/stores/match-store";
import { Tournament, Match } from "@/types";
import { formatDate } from "@/lib/utils";
import { LoadingState } from "@/components/LoadingState";
import {
  PageShell,
  PageHeader,
  GlassCard,
  SurfaceRow,
  SectionHeader,
  SportGlyph,
  Icon,
} from "@/components/ui/primitives";

export default function HomePage() {
  const { tournaments, loadTournaments, loading: tournamentsLoading, error: tournamentError } = useTournamentStore();
  const { recentMatches, loadRecentMatches, loading: matchesLoading, error: matchError } = useMatchStore();
  const router = useRouter();

  useEffect(() => {
    loadTournaments();
    loadRecentMatches();
  }, [loadTournaments, loadRecentMatches]);

  // Memoize sorted lists to prevent unnecessary re-renders
  const sortedTournaments = useMemo(
    () => [...tournaments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [tournaments]
  );

  const sortedMatches = useMemo(
    () => [...recentMatches].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [recentMatches]
  );

  const isLoading = tournamentsLoading || matchesLoading;
  const error = tournamentError || matchError;

  if (isLoading) {
    return <LoadingState message="Loading your tournaments and matches…" />;
  }

  return (
    <PageShell>
      <PageHeader
        title="Tournaments"
        subtitle="Run a bracket. Score a quick match."
        large
        action={
          <Link
            href="/settings"
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink)",
            }}
          >
            <Icon name="settings" size={18} stroke={1.75} />
          </Link>
        }
      />

      <div
        className="no-scrollbar"
        style={{ padding: "24px 22px 28px", overflowY: "auto", minHeight: "100%" }}
      >
        {/* Two primary actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 26,
          }}
        >
          <button
            onClick={() => router.push("/tournament/new")}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: "var(--accent-dark)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="trophy" size={18} color="#fff" stroke={1.6} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 15.5,
                  fontWeight: 600,
                }}
              >
                New tournament
              </div>
              <div
                style={{ fontSize: 12.5, color: "var(--ink-secondary)", marginTop: 2 }}
              >
                Bracket · seeding
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push("/match/new")}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: "var(--surface-3)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="bolt" size={18} stroke={1.6} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 15.5,
                  fontWeight: 600,
                }}
              >
                Quick match
              </div>
              <div
                style={{ fontSize: 12.5, color: "var(--ink-secondary)", marginTop: 2 }}
              >
                Two players · score
              </div>
            </div>
          </button>
        </div>

        {/* Tournaments */}
        <SectionHeader
          title="My tournaments"
          trailing={sortedTournaments.length || undefined}
        />
        {sortedTournaments.length === 0 ? (
          <GlassCard style={{ padding: "20px 16px", textAlign: "center", marginBottom: 26 }}>
            <span style={{ fontSize: 14, color: "var(--ink-tertiary)" }}>
              No tournaments yet
            </span>
          </GlassCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 26 }}>
            {sortedTournaments.map((t) => (
              <TournamentRow key={t.id} t={t} />
            ))}
          </div>
        )}

        {/* Recent matches */}
        <SectionHeader
          title="Recent matches"
          trailing={sortedMatches.length || undefined}
        />
        {sortedMatches.length === 0 ? (
          <GlassCard style={{ padding: "20px 16px", textAlign: "center" }}>
            <span style={{ fontSize: 14, color: "var(--ink-tertiary)" }}>
              No recent matches
            </span>
          </GlassCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sortedMatches.map((m) => (
              <MatchRow key={m.id} m={m} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function TournamentRow({ t }: Readonly<{ t: Tournament }>) {
  return (
    <Link href={`/tournament/${t.id}`} style={{ textDecoration: "none" }}>
      <SurfaceRow>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <SportGlyph sport={t.sportId} size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          <div
            style={{
              fontSize: 14.5,
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {t.name}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: "var(--sn)", color: "var(--sn-text)" }}>
              {t.sportId === "tt" ? "Table Tennis" : "Snooker"}
            </span>
            <span style={{ fontSize: 12.5, color: "var(--ink-secondary)" }}>{t.players.length} players · {t.status === "in-progress" ? "Live" : "upcoming"}</span>
          </div>
        </div>
        <Icon name="chevronRight" size={16} color="var(--ink-tertiary)" />
      </SurfaceRow>
    </Link>
  );
}

function MatchRow({ m }: Readonly<{ m: Match }>) {
  const p1Sets = m.sets.filter((s) => s.winnerId === m.player1Id).length;
  const p2Sets = m.sets.filter((s) => s.winnerId === m.player2Id).length;
  return (
    <Link href={`/match/${m.id}`} style={{ textDecoration: "none" }}>
      <SurfaceRow>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <SportGlyph sport={m.sportId} size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          <div
            style={{ fontSize: 14.5, fontWeight: 600 }}
          >
            {m.player1Name} vs {m.player2Name}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: "var(--sn)", color: "var(--sn-text)" }}>
              {m.sportId === "tt" ? "Table Tennis" : "Snooker"}
            </span>
            <span style={{ fontSize: 12.5, color: "var(--ink-secondary)" }}>Today</span>
          </div>
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink-secondary)" }}>
          {m.status === "completed" ? `${p1Sets}–${p2Sets}` : "–"}
        </div>
      </SurfaceRow>
    </Link>
  );
}
