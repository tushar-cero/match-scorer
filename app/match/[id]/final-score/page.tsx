"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMatchStore } from "@/stores/match-store";
import { getSportById } from "@/config/sports";
import { useToast } from "@/components/ui/Toast";
import { SetScore } from "@/types";
import {
  PageShell,
  PageHeader,
  GlassCard,
  PrimaryBtn,
  Icon,
} from "@/components/ui/primitives";
import { WinnerOverlay } from "@/components/scoring/WinnerOverlay";

export default function FinalScorePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentMatch, loadMatch, updateFinalScore } = useMatchStore();
  const { showToast } = useToast();

  const [scores, setScores] = useState<{ p1: string; p2: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMatch(id);
  }, [id]);

  useEffect(() => {
    if (currentMatch?.id === id) {
      const rows = currentMatch.sets.map((s) => ({
        p1:
          s.player1Score > 0 || s.player2Score > 0
            ? String(s.player1Score)
            : "",
        p2:
          s.player1Score > 0 || s.player2Score > 0
            ? String(s.player2Score)
            : "",
      }));
      setScores(
        rows.length > 0
          ? rows
          : Array.from(
              {
                length:
                  currentMatch.config.sets ??
                  currentMatch.config.bestOfFrames ??
                  5,
              },
              () => ({ p1: "", p2: "" }),
            ),
      );
    }
  }, [currentMatch?.id]);

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

  if (currentMatch.winnerId) {
    return (
      <WinnerOverlay
        winnerName={currentMatch.winnerName!}
        matchId={currentMatch.id}
        tournamentId={currentMatch.tournamentId}
      />
    );
  }

  const sport = getSportById(currentMatch.sportId);
  const isFrames = sport?.scoring.type === "frames";
  const totalSets = isFrames
    ? (currentMatch.config.bestOfFrames ?? 5)
    : (currentMatch.config.sets ?? 5);

  const setScore = (i: number, side: "p1" | "p2", val: string) => {
    const next = [...scores];
    while (next.length <= i) next.push({ p1: "", p2: "" });
    next[i] = { ...next[i], [side]: val.replaceAll(/\D/g, "") };
    setScores(next);
  };

  const handleSave = async () => {
    const p1Id = currentMatch.player1Id;
    const p2Id = currentMatch.player2Id;

    const builtSets: SetScore[] = scores.map((row, i) => {
      const p1 = Number.parseInt(row.p1) || 0;
      const p2 = Number.parseInt(row.p2) || 0;
      let winnerId: string | undefined;
      const target = isFrames ? 1 : (currentMatch.config.pointsPerSet ?? 11);
      if (isFrames) {
        if (p1 > p2) winnerId = p1Id;
        else if (p2 > p1) winnerId = p2Id;
      } else {
        const winByTwo = Math.abs(p1 - p2) >= 2;
        const reachedTarget = p1 >= target || p2 >= target;
        if (reachedTarget && winByTwo) {
          winnerId = p1 > p2 ? p1Id : p2Id;
        }
      }
      const hasScores = p1 > 0 || p2 > 0;
      let status: "upcoming" | "completed" | "in-progress";
      if (!hasScores) {
        status = "upcoming";
      } else if (winnerId) {
        status = "completed";
      } else {
        status = "in-progress";
      }
      return {
        setNumber: i + 1,
        player1Score: p1,
        player2Score: p2,
        winnerId,
        status,
      };
    });

    const played = builtSets.filter(
      (s) => s.player1Score > 0 || s.player2Score > 0,
    );
    if (played.length === 0) {
      showToast("Enter at least one set score");
      return;
    }

    setSaving(true);
    try {
      await updateFinalScore(builtSets);
      showToast("Score saved");
      router.push(`/match/${id}`);
    } catch {
      showToast("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const label = isFrames ? "Frame" : "Set";

  return (
    <PageShell>
      <PageHeader
        title="Enter score"
        onBack={() => router.push(`/match/${id}`)}
      />

      <div style={{ padding: "8px 16px 120px" }}>
        <div style={{ fontSize: 14, color: "var(--ink-3)", marginBottom: 20 }}>
          {currentMatch.player1Name} vs {currentMatch.player2Name}
        </div>

        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr 1fr",
            gap: 8,
            alignItems: "center",
            marginBottom: 8,
            padding: "0 4px",
          }}
        >
          <div style={{ width: 56 }} />
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--ink-3)",
              textAlign: "center",
            }}
          >
            {currentMatch.player1Name.split(" ")[0]}
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--ink-3)",
              textAlign: "center",
            }}
          >
            {currentMatch.player2Name.split(" ")[0]}
          </div>
        </div>

        <GlassCard style={{ padding: "6px 12px" }}>
          {Array.from({ length: totalSets }).map((_, i) => (
            <div
              key={`set-${i + 1}`}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr 1fr",
                gap: 8,
                alignItems: "center",
                padding: "8px 0",
                borderBottom:
                  i < totalSets - 1 ? "0.5px solid var(--line-2)" : "none",
              }}
            >
              <div
                style={{
                  width: 56,
                  fontSize: 12,
                  color: "var(--ink-4)",
                  fontFamily: "var(--font-geist-mono)",
                  whiteSpace: "nowrap",
                }}
              >
                {label} {i + 1}
              </div>
              <ScoreInput
                value={scores[i]?.p1 ?? ""}
                onChange={(v) => setScore(i, "p1", v)}
                placeholder="—"
              />
              <ScoreInput
                value={scores[i]?.p2 ?? ""}
                onChange={(v) => setScore(i, "p2", v)}
                placeholder="—"
              />
            </div>
          ))}
        </GlassCard>

        {/* Legend */}
        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "var(--ink-4)",
            textAlign: "center",
          }}
        >
          {isFrames
            ? "Enter frames won per player"
            : `First to ${currentMatch.config.pointsPerSet ?? 11} pts · win by 2`}
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 390,
          padding: "12px 16px 28px",
          background: "linear-gradient(to top, var(--bg) 60%, transparent)",
        }}
      >
        <PrimaryBtn
          large
          style={{ width: "100%" }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save result"}{" "}
          {!saving && <Icon name="check" size={16} color="#fff" />}
        </PrimaryBtn>
      </div>
    </PageShell>
  );
}

function ScoreInput({
  value,
  onChange,
  placeholder,
}: Readonly<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}>) {
  return (
    <input
      type="number"
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={
        {
          height: 44,
          borderRadius: 12,
          border: "0.5px solid var(--line)",
          background: value ? "var(--surface)" : "rgba(10,10,10,0.02)",
          fontFamily: "var(--font-geist-mono)",
          fontVariantNumeric: "tabular-nums",
          fontSize: 22,
          fontWeight: 600,
          textAlign: "center",
          color: "var(--ink)",
          outline: "none",
          width: "100%",
          appearance: "textfield",
          MozAppearance: "textfield",
        } as React.CSSProperties
      }
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--ink)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--line)";
      }}
    />
  );
}
