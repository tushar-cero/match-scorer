"use client";

import { useEffect } from "react";
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
  }, [id]);

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
        action={
          <Chip style={{ height: 24, fontSize: 11 }}>
            {currentTournament.status}
          </Chip>
        }
      />

      {/* Progress bar */}
      <div style={{ padding: "0 16px 8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Chip>
            <SportGlyph sport={currentTournament.sportId} size={14} />{" "}
            {sport?.name}
          </Chip>
          <Chip>Single elim</Chip>
          {currentTournament.status === "in-progress" && (
            <Chip
              style={{
                background: "rgba(47,125,50,0.10)",
                color: "#1f5c22",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "#2f7d32",
                }}
              />{" "}
              Live
            </Chip>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
            {completed} of {total} matches complete
          </div>
          <div
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 12,
              color: "var(--ink-4)",
            }}
          >
            {total > 0 ? Math.round((completed / total) * 100) : 0}%
          </div>
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 999,
            background: "rgba(10,10,10,0.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${total > 0 ? (completed / total) * 100 : 0}%`,
              height: "100%",
              background: "var(--ink)",
              transition: "width 0.4s",
            }}
          />
        </div>
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
        style={{ padding: "0 16px 56px", overflowY: "auto" }}
      >
        {currentTournament.bracket.map((round) => {
          const roundMatches = round.matches
            .map((mid) => tournamentMatches.find((m) => m.id === mid))
            .filter(Boolean) as Match[];
          const label = roundLabels[round.round] ?? `Round ${round.round}`;
          return (
            <div key={round.round} style={{ marginBottom: 22 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  margin: "4px 4px 10px",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--ink-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{ flex: 1, height: 0.5, background: "var(--line)" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
        borderRadius: 18,
        overflow: "hidden",
        border: isLive ? "1.5px solid var(--ink)" : undefined,
        position: "relative",
      }}
    >
      <BracketRow
        name={match.player1Name}
        score={match.sets.filter((s) => s.winnerId === match.player1Id).length}
        winner={match.winnerId === match.player1Id}
        done={match.status === "completed"}
      />
      <div style={{ height: "0.5px", background: "var(--line-2)" }} />
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
            background: "var(--ink)",
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
