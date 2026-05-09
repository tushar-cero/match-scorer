"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTournamentStore } from "@/stores/tournament-store";
import { useMatchStore } from "@/stores/match-store";
import { Tournament, Match } from "@/types";
import { formatDate } from "@/lib/utils";
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
  const { tournaments, loadTournaments } = useTournamentStore();
  const { recentMatches, loadRecentMatches } = useMatchStore();
  const router = useRouter();

  useEffect(() => {
    loadTournaments();
    loadRecentMatches();
  }, []);

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
              borderRadius: 12,
              background: "rgba(10,10,10,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="settings" size={18} />
          </Link>
        }
      />

      <div
        className="no-scrollbar"
        style={{ padding: "8px 16px 56px", overflowY: "auto" }}
      >
        {/* Two primary actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginTop: 8,
          }}
        >
          <GlassCard
            onClick={() => router.push("/tournament/new")}
            style={{
              height: 156,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "var(--ink)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="trophy" size={20} color="#fff" stroke={1.6} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                New tournament
              </div>
              <div
                style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}
              >
                Bracket · seeding
              </div>
            </div>
          </GlassCard>

          <GlassCard
            onClick={() => router.push("/match/new")}
            style={{
              height: 156,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "rgba(10,10,10,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="bolt" size={20} stroke={1.6} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                Quick match
              </div>
              <div
                style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}
              >
                Two players · score
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Tournaments */}
        <SectionHeader
          title="My tournaments"
          trailing={tournaments.length || undefined}
        />
        {tournaments.length === 0 ? (
          <GlassCard style={{ padding: "20px 16px", textAlign: "center" }}>
            <span style={{ fontSize: 14, color: "var(--ink-4)" }}>
              No tournaments yet
            </span>
          </GlassCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tournaments.map((t) => (
              <TournamentRow key={t.id} t={t} />
            ))}
          </div>
        )}

        {/* Recent matches */}
        <SectionHeader
          title="Recent matches"
          trailing={recentMatches.length || undefined}
        />
        {recentMatches.length === 0 ? (
          <GlassCard style={{ padding: "20px 16px", textAlign: "center" }}>
            <span style={{ fontSize: 14, color: "var(--ink-4)" }}>
              No recent matches
            </span>
          </GlassCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentMatches.map((m) => (
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
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#fafaf6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SportGlyph sport={t.sportId} size={28} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {t.name}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--ink-3)",
              marginTop: 2,
              display: "flex",
              gap: 6,
            }}
          >
            <span>{formatDate(t.createdAt)}</span>
            <span>·</span>
            <span>{t.players.length} players</span>
          </div>
        </div>
        {t.status === "in-progress" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "var(--tt)",
                boxShadow: "0 0 0 4px rgba(47,125,50,0.12)",
              }}
            />
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Live</span>
          </div>
        )}
        {t.status === "completed" && (
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
            {t.winner ? `🏆 ${t.winner}` : "Done"}
          </div>
        )}
        {t.status === "upcoming" && (
          <Icon name="chevronRight" size={16} color="var(--ink-4)" />
        )}
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
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#fafaf6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SportGlyph sport={m.sportId} size={26} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}
          >
            {m.player1Name}{" "}
            <span style={{ color: "var(--ink-4)", fontWeight: 400 }}>vs</span>{" "}
            {m.player2Name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 12.5,
              color: "var(--ink-3)",
              marginTop: 2,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {m.status === "completed" ? `${p1Sets}–${p2Sets}` : m.status} ·{" "}
            {formatDate(m.createdAt)}
          </div>
        </div>
        <Icon name="chevronRight" size={16} color="var(--ink-4)" />
      </SurfaceRow>
    </Link>
  );
}
