"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SPORTS, getSportById } from "@/config/sports";
import { useMatchStore } from "@/stores/match-store";
import { nanoid } from "@/lib/utils";
import { MatchConfig } from "@/types";
import { validatePlayerName, sanitizeInput } from "@/lib/validation";
import {
  PageShell,
  PageHeader,
  GlassCard,
  PrimaryBtn,
  DesignInput,
  Label,
  NumberPills,
  Icon,
  SportGlyph,
} from "@/components/ui/primitives";

export default function NewMatchPage() {
  const router = useRouter();
  const { createMatch } = useMatchStore();

  const [sportId, setSportId] = useState<string | null>(null);
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [sets, setSets] = useState(5);
  const [pointsPerSet, setPointsPerSet] = useState(11);
  const [bestOfFrames, setBestOfFrames] = useState(5);
  const [error, setError] = useState("");
  const [step, setStep] = useState<0 | 1>(0);

  const sport = sportId ? getSportById(sportId) : null;

  const handleSportSelect = (id: string) => {
    setSportId(id);
    const s = getSportById(id);
    if (s?.scoring.sets) {
      setSets(s.scoring.sets.defaultCount);
      setPointsPerSet(s.scoring.sets.pointsPerSet);
    }
    if (s?.scoring.frames) setBestOfFrames(s.scoring.frames.defaultBestOf);
    setStep(1);
  };

  const handleCreate = async () => {
    setError("");
    
    // Validate player names
    const p1Error = validatePlayerName(player1);
    if (p1Error) {
      setError(p1Error.message);
      return;
    }
    
    const p2Error = validatePlayerName(player2);
    if (p2Error) {
      setError(p2Error.message);
      return;
    }
    
    const p1 = sanitizeInput(player1);
    const p2 = sanitizeInput(player2);
    
    if (p1 === p2) {
      setError("Player names must be different");
      return;
    }
    
    if (!sportId) return;
    
    try {
      const config: MatchConfig = {
        sportId,
        ...(sport?.scoring.type === "sets-and-points"
          ? { sets, pointsPerSet }
          : { bestOfFrames }),
      };
      const m = await createMatch({
        sportId,
        player1Id: nanoid(),
        player2Id: nanoid(),
        player1Name: p1,
        player2Name: p2,
        config,
        status: "upcoming",
      });
      router.push(`/match/${m.id}`);
    } catch (err) {
      setError("Failed to create match. Please try again.");
      console.error("Error creating match:", err);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Quick match"
        onBack={() => (step === 0 ? router.back() : setStep(0))}
      />

      <div
        className="no-scrollbar"
        style={{ padding: "24px 22px 28px", overflowY: "auto", minHeight: "100%" }}
      >
        {step === 0 && (
          <>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "var(--surface-3)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Icon name="bolt" size={18} stroke={1.6} />
            </div>
            <div
              style={{
                fontSize: 23,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                marginBottom: 8,
              }}
            >
              Pick a sport
            </div>
            <div
              style={{
                fontSize: 14,
                color: "var(--ink-secondary)",
                marginBottom: 16,
              }}
            >
              Choose the sport to score.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SPORTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSportSelect(s.id)}
                  style={{
                    padding: "15px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    color: "inherit",
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
                      flexShrink: 0,
                    }}
                  >
                    <SportGlyph sport={s.id} size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                      }}
                    >
                      {s.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "var(--ink-secondary)",
                      }}
                    >
                      {s.scoring.type === "sets-and-points"
                        ? "Sets & Points"
                        : "Frames"}
                    </div>
                  </div>
                  <Icon name="chevronRight" size={18} color="var(--ink-tertiary)" />
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && sport && (
          <>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-0.025em",
                margin: "8px 0 18px",
              }}
            >
              Set up the match
            </div>

            {/* Sport chip */}
            <div
              className="glass"
              style={{
                borderRadius: 18,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#fafaf6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SportGlyph sport={sport.id} size={26} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--ink-4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Sport
                </div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {sport.name}
                </div>
              </div>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setStep(0)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 13,
                  color: "var(--ink-3)",
                }}
              >
                <Icon name="swap" size={14} /> Change
              </button>
            </div>

            <Label>Players</Label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 22,
              }}
            >
              <div
                className="surface-card"
                style={{
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    background: "var(--avatar-1)",
                    color: "var(--avatar-1-text)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  A
                </div>
                <DesignInput
                  value={player1}
                  onChange={(e) => setPlayer1(e.target.value)}
                  placeholder="Player A name"
                  style={{
                    height: 36,
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    flex: 1,
                  }}
                  autoFocus
                />
              </div>
              <div
                className="surface-card"
                style={{
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    background: "var(--avatar-3)",
                    color: "var(--avatar-3-text)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  B
                </div>
                <DesignInput
                  value={player2}
                  onChange={(e) => setPlayer2(e.target.value)}
                  placeholder="Player B name"
                  style={{
                    height: 36,
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    flex: 1,
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
            </div>

            {sport.scoring.type === "sets-and-points" && sport.scoring.sets && (
              <>
                <Label>Best of</Label>
                <NumberPills
                  value={sets}
                  options={sport.scoring.sets.options.filter((o) => o <= 7)}
                  onChange={setSets}
                />
                <div style={{ marginTop: 22 }} />
                <Label>Points / set</Label>
                <NumberPills
                  value={pointsPerSet}
                  options={sport.scoring.sets.pointsPerSetOptions}
                  onChange={setPointsPerSet}
                />
              </>
            )}
            {sport.scoring.type === "frames" && sport.scoring.frames && (
              <>
                <Label>Best of frames</Label>
                <NumberPills
                  value={bestOfFrames}
                  options={sport.scoring.frames.options}
                  onChange={setBestOfFrames}
                />
              </>
            )}

            {error && (
              <div
                style={{ fontSize: 13, color: "var(--warn)", marginTop: 12 }}
              >
                {error}
              </div>
            )}
          </>
        )}
      </div>

      {step === 1 && (
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
          <PrimaryBtn large style={{ width: "100%" }} onClick={handleCreate}>
            Start match <Icon name="arrowRight" size={16} color="#fff" />
          </PrimaryBtn>
        </div>
      )}
    </PageShell>
  );
}
