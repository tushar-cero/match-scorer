"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTournamentStore } from "@/stores/tournament-store";
import { getSportById } from "@/config/sports";
import { Match } from "@/types";
import {
  PageShell,
  PageHeader,
  GlassCard,
  Chip,
  SportGlyph,
} from "@/components/ui/primitives";

export default function TournamentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentTournament, tournamentMatches, loadTournament } =
    useTournamentStore();

  useEffect(() => {
    loadTournament(id);
  }, [id, loadTournament]);

  // Optimize N+1 query pattern: create a Map for O(1) lookups
  const matchesById = useMemo(() => {
    const map = new Map<string, Match>();
    tournamentMatches.forEach((m) => map.set(m.id, m));
    return map;
  }, [tournamentMatches]);

  if (currentTournament?.id !== id) {
    return (
      <PageShell>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            color: "var(--ink-4)",
            fontSize: 14,
          }}
        >
          Loading…
        </div>
      </PageShell>
    );
  }

  const sport = getSportById(currentTournament.sportId);
  const completed = tournamentMatches.filter(
    (m) => m.status === "completed",
  ).length;
  const total = tournamentMatches.filter(
    (m) =>
      m.player1Name !== "TBD" &&
      m.player2Name !== "TBD" &&
      m.player1Name !== "BYE" &&
      m.player2Name !== "BYE",
  ).length;

  const roundLabels: Record<number, string> = {
    1: "Round 1",
    2: currentTournament.bracket.length === 2 ? "Final" : "Semifinals",
    3: currentTournament.bracket.length === 3 ? "Final" : "Quarterfinals",
  };
  if (currentTournament.bracket.length > 0) {
    roundLabels[currentTournament.bracket.length] = "Final";
  }

  return (
    <PageShell>
      <PageHeader
        title={currentTournament.name}
        onBack={() => router.back()}
      />

      {/* Content */}
      <div className="no-scrollbar" style={{ padding: "24px 22px 28px", overflowY: "auto" }}>
        {/* Info bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div>
            <Chip style={{ height: 24, fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: "var(--sn)", color: "var(--sn-text)" }}>
              {currentTournament.sportId === "tt" ? "Table Tennis" : "Snooker"}
            </Chip>
            <div style={{ fontSize: 13, color: "var(--ink-secondary)", marginTop: 4 }}>
              {currentTournament.players.length} players · single elimination
            </div>
          </div>
        </div>

        {/* Bracket rounds */}
      </div>

      {/* Winner banner */}
      {currentTournament.status === "completed" && currentTournament.winner && (
        <div style={{ padding: "0 16px 16px" }}>
          <GlassCard
            style={{
              padding: "20px 18px",
              textAlign: "center",
              border: "1.5px solid var(--ink)",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
            <div
              style={{
                fontSize: 13,
                color: "var(--ink-3)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Tournament Winner
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              {currentTournament.winner}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Bracket */}
      <div
        className="no-scrollbar"
        style={{ padding: "24px 22px 28px", overflowY: "auto", minHeight: "100%" }}
      >
       {currentTournament.bracket.map((round) => {
           const roundMatches = round.matches
             .map((mid) => matchesById.get(mid))
             .filter(Boolean) as Match[];
           const label = roundLabels[round.round] ?? `Round ${round.round}`;
          return (
            <div key={round.round} style={{ marginBottom: 22 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--ink-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 9,
                  paddingLeft: 2,
                }}
              >
                {label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {roundMatches.map((m) => {
                  if (m.player1Name === "BYE" || m.player2Name === "BYE")
                    return null;
                  return (
                    <Link
                      key={m.id}
                      href={
                        m.player1Name !== "TBD" && m.player2Name !== "TBD"
                          ? `/match/${m.id}`
                          : "#"
                      }
                      style={{ textDecoration: "none" }}
                    >
                      <BracketMatchCard match={m} />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

function BracketMatchCard({ match }: Readonly<{ match: Match }>) {
  const isLive = match.status === "in-progress";
  return (
    <div
      className="glass"
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: isLive ? "1px solid var(--accent-dark)" : "1px solid var(--border)",
        position: "relative",
      }}
    >
      <BracketRow
        name={match.player1Name}
        score={match.sets.filter((s) => s.winnerId === match.player1Id).length}
        winner={match.winnerId === match.player1Id}
        done={match.status === "completed"}
      />
      <div style={{ height: "1px", background: "var(--border)" }} />
      <BracketRow
        name={match.player2Name}
        score={match.sets.filter((s) => s.winnerId === match.player2Id).length}
        winner={match.winnerId === match.player2Id}
        done={match.status === "completed"}
      />
      {isLive && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 10,
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 8px",
            borderRadius: 999,
            background: "var(--accent-dark)",
            color: "#fff",
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: 999,
              background: "#fff",
            }}
          />
          LIVE
        </div>
      )}
    </div>
  );
}

function BracketRow({
  name,
  score,
  winner,
  done,
}: Readonly<{
  name: string;
  score: number;
  winner: boolean;
  done: boolean;
}>) {
  const tbd = name === "TBD";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 16px",
        opacity: tbd ? 0.45 : 1,
      }}
    >
      <div
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: winner ? 600 : 400,
          color: winner ? "var(--ink)" : done ? "var(--ink-3)" : "var(--ink-2)",
          letterSpacing: "-0.01em",
        }}
      >
        {name}
      </div>
      {winner && <div style={{ marginRight: 10 }}>🏆</div>}
      <div
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: 17,
          fontWeight: 600,
          color: winner ? "var(--ink)" : "var(--ink-4)",
          minWidth: 22,
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {tbd ? "—" : score}
      </div>
    </div>
  );
}
