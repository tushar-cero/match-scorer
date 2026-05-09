"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SPORTS, getSportById } from "@/config/sports";
import { useTournamentStore } from "@/stores/tournament-store";
import { Player, MatchConfig } from "@/types";
import { nanoid, shuffle } from "@/lib/utils";
import {
  PageShell,
  PageHeader,
  StepBar,
  GlassCard,
  PrimaryBtn,
  DesignInput,
  Label,
  NumberPills,
  Icon,
  SportGlyph,
} from "@/components/ui/primitives";

type Step = 0 | 1 | 2 | 3 | 4;
const STEPS = ["Sport", "Details", "Players", "Format", "Review"];

export default function NewTournamentPage() {
  const router = useRouter();
  const { createTournament } = useTournamentStore();

  const [step, setStep] = useState<Step>(0);
  const [sportId, setSportId] = useState<string>("tt");
  const [name, setName] = useState("");
  const [playerCount, setPlayerCount] = useState(8);
  const [players, setPlayers] = useState<Player[]>([]);
  const [sets, setSets] = useState(5);
  const [pointsPerSet, setPointsPerSet] = useState(11);
  const [bestOfFrames, setBestOfFrames] = useState(5);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const sport = getSportById(sportId);

  const goBack = () => {
    if (step === 0) router.back();
    else setStep((s) => (s - 1) as Step);
  };

  const handleSportSelect = (id: string) => {
    setSportId(id);
    const s = getSportById(id);
    if (s?.scoring.sets) {
      setSets(s.scoring.sets.defaultCount);
      setPointsPerSet(s.scoring.sets.pointsPerSet);
    }
    if (s?.scoring.frames) setBestOfFrames(s.scoring.frames.defaultBestOf);
    advance();
  };

  const advance = () => setStep((s) => Math.min(4, s + 1) as Step);

  const handleDetailsNext = () => {
    if (!name.trim()) {
      setError("Tournament name is required");
      return;
    }
    setError("");
    const slots = Array.from({ length: playerCount }, (_, i) => ({
      id: nanoid(),
      name: players[i]?.name || "",
      seed: i + 1,
    }));
    setPlayers(slots);
    advance();
  };

  const handlePlayersNext = () => {
    if (players.some((p) => !p.name.trim())) {
      setError("All player names are required");
      return;
    }
    const names = players.map((p) => p.name.trim());
    if (new Set(names).size !== names.length) {
      setError("Player names must be unique");
      return;
    }
    setError("");
    advance();
  };

  const handleCreate = async () => {
    if (!sportId) return;
    setCreating(true);
    try {
      const config: MatchConfig = {
        sportId,
        ...(sport?.scoring.type === "sets-and-points"
          ? { sets, pointsPerSet }
          : { bestOfFrames }),
      };
      const t = await createTournament({
        name: name.trim(),
        sportId,
        players: players.map((p, i) => ({ ...p, seed: i + 1 })),
        matchConfig: config,
        format: "single-elimination",
      });
      router.push(`/tournament/${t.id}`);
    } finally {
      setCreating(false);
    }
  };

  const updatePlayer = (i: number, val: string) =>
    setPlayers((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, name: val } : p)),
    );

  const randomize = () =>
    setPlayers((prev) => shuffle(prev).map((p, i) => ({ ...p, seed: i + 1 })));

  return (
    <PageShell>
      <PageHeader
        title={`Step ${step + 1} · ${STEPS[step]}`}
        onBack={goBack}
        action={
          <div
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 13,
              color: "var(--ink-3)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {step + 1}/{STEPS.length}
          </div>
        }
      />
      <StepBar total={STEPS.length} current={step} />

      <div
        className="no-scrollbar"
        style={{
          padding: "4px 16px 100px",
          overflowY: "auto",
          height: "calc(100vh - 140px)",
        }}
      >
        {/* Step 0: Sport */}
        {step === 0 && (
          <>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-0.025em",
                margin: "8px 0 4px",
              }}
            >
              Pick a sport
            </div>
            <div
              style={{
                fontSize: 14.5,
                color: "var(--ink-3)",
                marginBottom: 16,
              }}
            >
              You can change defaults later.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SPORTS.map((s) => (
                <GlassCard
                  key={s.id}
                  onClick={() => handleSportSelect(s.id)}
                  style={{
                    padding: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    border:
                      sportId === s.id ? "1.5px solid var(--ink)" : undefined,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: "#fafaf6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SportGlyph sport={s.id} size={40} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 600,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {s.name}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
                      {s.scoring.type === "sets-and-points"
                        ? "Sets & Points"
                        : "Frames"}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      border:
                        sportId === s.id ? "none" : "1.5px solid var(--line)",
                      background:
                        sportId === s.id ? "var(--ink)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {sportId === s.id && (
                      <Icon name="check" size={13} color="#fff" stroke={2.4} />
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-0.025em",
                margin: "8px 0 16px",
              }}
            >
              Tournament details
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <Label>Name</Label>
                <DesignInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Friday Night Cup"
                  autoFocus
                />
              </div>
              <div>
                <Label>Players</Label>
                <NumberPills
                  value={playerCount}
                  options={[2, 4, 6, 8, 16, 32]}
                  onChange={setPlayerCount}
                />
                <div
                  style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 8 }}
                >
                  {playerCount} players · single elimination bracket
                </div>
              </div>
              <div>
                <Label>Format</Label>
                <div
                  className="surface-card"
                  style={{ borderRadius: 14, padding: "14px 16px" }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        border: "none",
                        background: "var(--ink)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 999,
                          background: "#fff",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, fontSize: 15 }}>
                      Single elimination
                    </div>
                  </div>
                </div>
              </div>
              {error && (
                <div style={{ fontSize: 13, color: "var(--warn)" }}>
                  {error}
                </div>
              )}
            </div>
          </>
        )}

        {/* Step 2: Players */}
        {step === 2 && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                margin: "8px 0 12px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 600,
                    letterSpacing: "-0.025em",
                  }}
                >
                  Players
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    color: "var(--ink-3)",
                    marginTop: 2,
                  }}
                >
                  Drag to reorder seeding
                </div>
              </div>
              <button
                onClick={randomize}
                className="glass"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  height: 32,
                  padding: "0 12px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "inherit",
                }}
              >
                <Icon name="shuffle" size={13} /> Randomize
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {players.map((p, i) => (
                <div
                  key={p.id}
                  className="surface-card"
                  style={{
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-geist-mono)",
                      width: 28,
                      fontSize: 13,
                      color: "var(--ink-4)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    #{i + 1}
                  </div>
                  <DesignInput
                    value={p.name}
                    onChange={(e) => updatePlayer(i, e.target.value)}
                    placeholder={`Player ${i + 1}`}
                    style={{
                      height: 36,
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      flex: 1,
                    }}
                  />
                  <Icon name="drag" size={18} color="var(--ink-4)" />
                </div>
              ))}
            </div>
            {error && (
              <div style={{ fontSize: 13, color: "var(--warn)", marginTop: 8 }}>
                {error}
              </div>
            )}
          </>
        )}

        {/* Step 3: Format */}
        {step === 3 && sport && (
          <>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-0.025em",
                margin: "8px 0 16px",
              }}
            >
              Match format
            </div>
            {sport.scoring.type === "sets-and-points" && sport.scoring.sets && (
              <>
                <Label>Sets per match</Label>
                <NumberPills
                  value={sets}
                  options={sport.scoring.sets.options}
                  onChange={setSets}
                />
                <div style={{ marginTop: 22 }} />
                <Label>Points per set</Label>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {sport.scoring.sets.pointsPerSetOptions.map((o) => (
                    <button
                      key={o}
                      className="surface-card"
                      style={{
                        borderRadius: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "14px 16px",
                        cursor: "pointer",
                        width: "100%",
                        border: "none",
                        background: "none",
                        fontFamily: "inherit",
                        textAlign: "left",
                      }}
                      onClick={() => setPointsPerSet(o)}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 999,
                          border:
                            pointsPerSet === o
                              ? "none"
                              : "1.5px solid var(--line)",
                          background:
                            pointsPerSet === o ? "var(--ink)" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {pointsPerSet === o && (
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: 999,
                              background: "#fff",
                            }}
                          />
                        )}
                      </div>
                      <div style={{ flex: 1, fontSize: 15 }}>
                        {o} — {o === 11 ? "Modern" : "Traditional"}
                      </div>
                    </button>
                  ))}
                </div>
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
          </>
        )}

        {/* Step 4: Review */}
        {step === 4 && sport && (
          <>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-0.025em",
                margin: "8px 0 16px",
              }}
            >
              Review
            </div>
            <GlassCard style={{ borderRadius: 18, padding: "4px 18px" }}>
              {[
                { k: "Sport", v: sport.name },
                { k: "Name", v: name },
                { k: "Players", v: String(players.length) },
                { k: "Format", v: "Single elimination" },
                ...(sport.scoring.type === "sets-and-points"
                  ? [
                      { k: "Sets", v: `Best of ${sets}` },
                      { k: "Points / set", v: `${pointsPerSet}, win by 2` },
                    ]
                  : [{ k: "Frames", v: `Best of ${bestOfFrames}` }]),
              ].map(({ k, v }, i, arr) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom:
                      i < arr.length - 1 ? "0.5px solid var(--line-2)" : "none",
                  }}
                >
                  <div style={{ fontSize: 13.5, color: "var(--ink-3)" }}>
                    {k}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </GlassCard>
            <div
              style={{
                marginTop: 18,
                padding: 16,
                borderRadius: 18,
                background: "rgba(10,10,10,0.03)",
                display: "flex",
                gap: 10,
              }}
            >
              <Icon name="bolt" size={16} color="var(--ink-2)" />
              <div
                style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}
              >
                We'll generate a bracket and seed players in the order you set.
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom CTA */}
      {step > 0 && (
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
            onClick={
              step === 1
                ? handleDetailsNext
                : step === 2
                  ? handlePlayersNext
                  : step === 4
                    ? handleCreate
                    : advance
            }
            disabled={creating}
          >
            {step === 4
              ? creating
                ? "Creating…"
                : "Create tournament"
              : "Continue"}
            {step !== 4 && <Icon name="arrowRight" size={16} color="#fff" />}
          </PrimaryBtn>
        </div>
      )}
    </PageShell>
  );
}
