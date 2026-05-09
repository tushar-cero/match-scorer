"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMatchStore } from "@/stores/match-store";
import { useTournamentStore } from "@/stores/tournament-store";
import { getSportById } from "@/config/sports";
import {
  PageShell,
  PageHeader,
  GlassCard,
  SectionHeader,
  Chip,
  Icon,
  SportGlyph,
} from "@/components/ui/primitives";

export default function MatchPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentMatch, loadMatch, setScoringMode } = useMatchStore();
  const { completeMatch, currentTournament } = useTournamentStore();

  useEffect(() => {
    loadMatch(id);
  }, [id]);

  if (currentMatch?.id !== id) {
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

  const sport = getSportById(currentMatch.sportId);
  const p1Sets = currentMatch.sets.filter(
    (s) => s.winnerId === currentMatch.player1Id,
  ).length;
  const p2Sets = currentMatch.sets.filter(
    (s) => s.winnerId === currentMatch.player2Id,
  ).length;

  const handleMode = async (mode: "final" | "live") => {
    await setScoringMode(mode);
    router.push(`/match/${id}/${mode === "live" ? "live" : "final-score"}`);
  };

  const handleComplete = async () => {
    if (
      currentMatch.winnerId &&
      currentMatch.winnerName &&
      currentMatch.tournamentId &&
      currentTournament
    ) {
      await completeMatch(
        currentMatch.id,
        currentMatch.winnerId,
        currentMatch.winnerName,
      );
    }
    router.push(
      currentMatch.tournamentId
        ? `/tournament/${currentMatch.tournamentId}`
        : "/",
    );
  };

  return (
    <PageShell>
      <PageHeader
        title="Match"
        onBack={() =>
          router.push(
            currentMatch.tournamentId
              ? `/tournament/${currentMatch.tournamentId}`
              : "/",
          )
        }
        action={
          <Chip style={{ height: 24, fontSize: 11 }}>
            {currentMatch.status}
          </Chip>
        }
      />

      <div style={{ padding: "0 16px" }}>
        {/* Match card */}
        <GlassCard
          style={{
            padding: "22px 18px",
            position: "relative",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(120% 80% at 50% 0%, rgba(10,10,10,0.04), transparent 60%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <Chip>
              <SportGlyph sport={currentMatch.sportId} size={14} />{" "}
              {sport?.name}
            </Chip>
            <Chip>
              {sport?.scoring.type === "sets-and-points"
                ? `Best of ${currentMatch.config.sets}`
                : `Best of ${currentMatch.config.bestOfFrames} frames`}
            </Chip>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              justifyContent: "space-between",
            }}
          >
            <PlayerPill
              name={currentMatch.player1Name}
              tag="A"
              sets={p1Sets}
              winner={currentMatch.winnerId === currentMatch.player1Id}
            />
            <div
              style={{ fontSize: 14, color: "var(--ink-4)", fontWeight: 500 }}
            >
              vs
            </div>
            <PlayerPill
              name={currentMatch.player2Name}
              tag="B"
              sets={p2Sets}
              winner={currentMatch.winnerId === currentMatch.player2Id}
              right
            />
          </div>
          <div
            style={{
              marginTop: 18,
              padding: "12px 14px",
              borderRadius: 14,
              background: "rgba(10,10,10,0.03)",
              fontSize: 13,
              color: "var(--ink-3)",
              textAlign: "center",
            }}
          >
            {sport?.scoring.type === "sets-and-points"
              ? `First to ${Math.ceil((currentMatch.config.sets ?? 3) / 2)} sets · ${currentMatch.config.pointsPerSet} pts · win by 2`
              : `First to ${Math.ceil((currentMatch.config.bestOfFrames ?? 5) / 2)} frames`}
          </div>
        </GlassCard>

        {/* Scoring mode */}
        {currentMatch.status !== "completed" && (
          <>
            <SectionHeader title="How will you score?" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <GlassCard
                onClick={() => handleMode("live")}
                style={{
                  padding: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  border: "1.5px solid var(--ink)",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "var(--ink)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="play" size={20} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Live scoring
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--ink-3)",
                      marginTop: 2,
                    }}
                  >
                    Tap to score in real time
                  </div>
                </div>
                <Icon name="chevronRight" size={18} color="var(--ink-3)" />
              </GlassCard>
              <button
                className="surface-card"
                onClick={() => handleMode("final")}
                style={{
                  borderRadius: 22,
                  padding: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                  width: "100%",
                  border: "none",
                  background: "none",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "#fafaf6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="edit" size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Enter final score
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--ink-3)",
                      marginTop: 2,
                    }}
                  >
                    Already played — just record it
                  </div>
                </div>
                <Icon name="chevronRight" size={18} color="var(--ink-4)" />
              </button>
            </div>
          </>
        )}

        {/* Resume or done */}
        {currentMatch.status === "in-progress" && currentMatch.scoringMode && (
          <button
            onClick={() =>
              router.push(
                `/match/${id}/${currentMatch.scoringMode === "live" ? "live" : "final-score"}`,
              )
            }
            style={{
              marginTop: 12,
              width: "100%",
              height: 52,
              borderRadius: 16,
              border: "none",
              background: "var(--ink)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Resume scoring
          </button>
        )}

        {currentMatch.status === "completed" && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 18,
              background: "rgba(10,10,10,0.03)",
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 4 }}
            >
              Match complete
            </div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              🏆 {currentMatch.winnerName}
            </div>
            {currentMatch.tournamentId && (
              <button
                onClick={handleComplete}
                style={{
                  marginTop: 12,
                  height: 44,
                  padding: "0 20px",
                  borderRadius: 14,
                  border: "none",
                  background: "var(--ink)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Back to bracket
              </button>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function PlayerPill({
  name,
  tag,
  sets,
  winner,
  right,
}: Readonly<{
  name: string;
  tag: string;
  sets: number;
  winner: boolean;
  right?: boolean;
}>) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: right ? "flex-end" : "flex-start",
        gap: 8,
        flex: 1,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
          background: tag === "A" ? "var(--ink)" : "#fff",
          color: tag === "A" ? "#fff" : "var(--ink)",
          border: tag === "B" ? "0.5px solid var(--line)" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        {tag}
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>
        {name}
      </div>
      {winner && (
        <div style={{ fontSize: 12, color: "var(--ink-3)" }}>🏆 Won {sets}</div>
      )}
      {!winner && sets > 0 && (
        <div
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: 13,
            color: "var(--ink-4)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {sets}
        </div>
      )}
    </div>
  );
}
