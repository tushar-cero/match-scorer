"use client";

import { useState } from "react";
import { Match } from "@/types";
import { useMatchStore } from "@/stores/match-store";
import { useToast } from "@/components/ui/Toast";
import { WinnerOverlay } from "./WinnerOverlay";
import { Icon } from "@/components/ui/primitives";

const BALLS = [
  { id: "red", label: "Red", v: 1, color: "#c1452b" },
  { id: "yellow", label: "Yellow", v: 2, color: "#e6b517" },
  { id: "green", label: "Green", v: 3, color: "#2f7d32" },
  { id: "brown", label: "Brown", v: 4, color: "#5e3a1a" },
  { id: "blue", label: "Blue", v: 5, color: "#1a4f8a" },
  { id: "pink", label: "Pink", v: 6, color: "#d96b9a" },
  { id: "black", label: "Black", v: 7, color: "#0a0a0a" },
];

interface Props {
  readonly match: Match;
  readonly onBack: () => void;
}

export function LiveScoringSnooker({ match, onBack }: Props) {
  const { addLiveAction, undoAction, endSnookerFrame, currentMatch } =
    useMatchStore();
  const { showToast } = useToast();
  const [foulSide, setFoulSide] = useState<"p1" | "p2" | null>(null);
  const [showLog, setShowLog] = useState(false);

  const m = currentMatch || match;
  const currentFrame =
    m.sets.find((s) => s.status === "in-progress") || m.sets[0];
  const p1Score = currentFrame?.player1Score ?? 0;
  const p2Score = currentFrame?.player2Score ?? 0;
  const framesToWin = Math.ceil(m.sets.length / 2);
  const p1Frames = m.sets.filter((s) => s.winnerId === m.player1Id).length;
  const p2Frames = m.sets.filter((s) => s.winnerId === m.player2Id).length;

  const addBall = async (playerId: string, ballId: string, v: number) => {
    await addLiveAction(playerId, ballId, v, playerId);
  };

  const handleFoul = async (v: number) => {
    if (!foulSide) return;
    const opponentId = foulSide === "p1" ? m.player2Id : m.player1Id;
    await addLiveAction(
      foulSide === "p1" ? m.player1Id : m.player2Id,
      "foul",
      v,
      opponentId,
      { foulValue: v },
    );
    showToast(`Foul: ${v} pts to opponent`);
    setFoulSide(null);
  };

  const undo = async () => {
    if (m.liveActions.length === 0) return;
    await undoAction();
    showToast("Undone");
  };

  const endFrame = async () => {
    await endSnookerFrame();
    showToast("Frame ended");
  };

  if (m.winnerId)
    return (
      <WinnerOverlay
        winnerName={m.winnerName!}
        matchId={m.id}
        tournamentId={m.tournamentId}
      />
    );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--surface)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top pill */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 5,
        }}
      >
        <div
          className="glass"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 14px 7px 10px",
            borderRadius: 20,
          }}
        >
          <button
            onClick={onBack}
            style={{
              width: 24,
              height: 24,
              borderRadius: 50,
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--ink-tertiary)",
            }}
          >
            <Icon name="x" size={14} stroke={1.75} />
          </button>
          <div
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 11.5,
              fontWeight: 700,
              color: "var(--ink)",
              whiteSpace: "nowrap",
              letterSpacing: "0.05em",
            }}
          >
            FRAME {currentFrame?.setNumber ?? 1} · BO{m.config.bestOfFrames ?? 5}
          </div>
        </div>
      </div>

      {/* Split */}
      <div style={{ display: "flex", flex: 1 }}>
        <SnookerHalf
          name={m.player1Name}
          score={p1Score}
          framesWon={p1Frames}
          framesToWin={framesToWin}
          side="left"
          onBall={(id, v) => addBall(m.player1Id, id, v)}
          onFoul={() => setFoulSide("p1")}
          onUndo={undo}
        />
        <div
          style={{ width: "0.5px", background: "var(--line)", flexShrink: 0 }}
        />
        <SnookerHalf
          name={m.player2Name}
          score={p2Score}
          framesWon={p2Frames}
          framesToWin={framesToWin}
          side="right"
          onBall={(id, v) => addBall(m.player2Id, id, v)}
          onFoul={() => setFoulSide("p2")}
          onUndo={undo}
        />
      </div>

      {/* Bottom controls */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 5,
        }}
      >
        <div
          className="glass"
          style={{ display: "flex", gap: 4, padding: 5, borderRadius: 999 }}
        >
          <BarBtn
            label="Undo"
            icon="undo"
            onClick={undo}
            disabled={m.liveActions.length === 0}
          />
          <BarBtn
            label="Log"
            icon="list"
            onClick={() => setShowLog((v) => !v)}
          />
          <BarBtn label="End frame" icon="check" onClick={endFrame} />
        </div>
      </div>

      {/* Foul sheet */}
      {foulSide && (
        <button
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10,10,10,0.32)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "flex-end",
            zIndex: 20,
          }}
          onClick={() => setFoulSide(null)}
        >
          <dialog
            open
            style={{
              width: "100%",
              background: "#fff",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: "14px 18px 36px",
              border: "none",
              margin: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 999,
                background: "rgba(10,10,10,0.15)",
                margin: "0 auto 14px",
              }}
            />
            <div style={{ fontSize: 18, fontWeight: 600 }}>Foul value</div>
            <div
              style={{
                fontSize: 13,
                color: "var(--ink-3)",
                marginTop: 2,
                marginBottom: 14,
              }}
            >
              Points awarded to{" "}
              <b>{foulSide === "p1" ? m.player2Name : m.player1Name}</b>.
              Minimum 4.
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
              }}
            >
              {[4, 5, 6, 7].map((v) => (
                <button
                  key={v}
                  onClick={() => handleFoul(v)}
                  style={{
                    height: 64,
                    borderRadius: 16,
                    border: "1px solid var(--line)",
                    background: "#fafaf8",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <div
                    style={{
                      fontVariantNumeric: "tabular-nums",
                      fontWeight: 600,
                      fontSize: 26,
                    }}
                  >
                    {v}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-4)" }}>
                    {v === 4
                      ? "Min"
                      : v === 5
                        ? "Blue"
                        : v === 6
                          ? "Pink"
                          : "Black"}
                  </div>
                </button>
              ))}
            </div>
          </dialog>
        </button>
      )}

      {/* Score log sheet */}
      {showLog && (
        <button
          tabIndex={0}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10,10,10,0.32)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "flex-end",
            zIndex: 20,
          }}
          onClick={() => setShowLog(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") setShowLog(false);
          }}
        >
          <button
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              background: "#fff",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: "14px 18px 40px",
              maxHeight: "60vh",
              overflowY: "auto",
            }}
            className="no-scrollbar"
          >
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 999,
                background: "rgba(10,10,10,0.15)",
                margin: "0 auto 14px",
              }}
            />
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>
              Score log
            </div>
            {m.liveActions.length === 0 && (
              <div
                style={{
                  fontSize: 14,
                  color: "var(--ink-4)",
                  textAlign: "center",
                  padding: "20px 0",
                }}
              >
                No actions yet
              </div>
            )}
            {[...m.liveActions].reverse().map((a) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "0.5px solid var(--line-2)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: 11.5,
                    color: "var(--ink-4)",
                    width: 36,
                  }}
                >
                  {new Date(a.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 500 }}>
                    {a.playerId === m.player1Id ? m.player1Name : m.player2Name}
                  </span>
                  <span style={{ color: "var(--ink-3)" }}>
                    {" "}
                    · {a.actionType} +{a.pointsAwarded}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: 12,
                    color: "var(--ink-4)",
                  }}
                >
                  F{a.setNumber}
                </div>
              </div>
            ))}
          </button>
        </button>
      )}
    </div>
  );
}

function SnookerHalf({
  name,
  score,
  framesWon,
  framesToWin,
  side,
  onBall,
  onFoul,
  onUndo,
}: Readonly<{
  name: string;
  score: number;
  framesWon: number;
  framesToWin: number;
  side: "left" | "right";
  onBall: (id: string, v: number) => void;
  onFoul: () => void;
  onUndo: () => void;
}>) {
  const bg = side === "left" ? "#fafaf8" : "#ffffff";
  return (
    <div
      style={{
        flex: 1,
        background: bg,
        display: "flex",
        flexDirection: "column",
        padding: "94px 10px 80px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <div
          style={{
            fontSize: 13,
            color: "var(--ink-3)",
            fontWeight: 500,
            marginBottom: 6,
          }}
        >
          {name}
        </div>
        <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
          {Array.from({ length: framesToWin }, (_, i) => i).map((i) => (
            <div
              key={`frame-dot-${i}`}
              style={{
                width: 5,
                height: 5,
                borderRadius: 999,
                background:
                  i < framesWon ? "var(--ink)" : "rgba(10,10,10,0.12)",
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <div
          style={{
            fontVariantNumeric: "tabular-nums",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            fontSize: 56,
            lineHeight: 1,
          }}
        >
          {score}
        </div>
      </div>
      {/* Ball grid 3×3 */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 6,
          alignContent: "center",
        }}
      >
        {BALLS.map((b) => (
          <button
            key={b.id}
            onClick={() => onBall(b.id, b.v)}
            aria-label={`${b.label} ${b.v}`}
            className="ball-shading"
            style={{
              aspectRatio: "1/1",
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-geist-mono)",
              fontWeight: 600,
              fontSize: 17,
              color: "#fff",
              background: b.color,
              transition: "transform 0.12s",
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(0.92)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1)";
            }}
          >
            {b.v}
          </button>
        ))}
        <button
          onClick={onFoul}
          style={{
            aspectRatio: "1/1",
            borderRadius: 14,
            border: "1.5px dashed var(--warn)",
            background: "transparent",
            color: "var(--warn)",
            fontFamily: "inherit",
            fontWeight: 600,
            fontSize: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          FOUL
        </button>
        <button
          onClick={onUndo}
          style={{
            aspectRatio: "1/1",
            borderRadius: 14,
            border: "none",
            background: "rgba(10,10,10,0.04)",
            color: "var(--ink-3)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="undo" size={16} />
        </button>
      </div>
    </div>
  );
}

function BarBtn({
  label,
  icon,
  onClick,
  disabled,
}: Readonly<{
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        height: 38,
        padding: "0 14px",
        borderRadius: 999,
        border: "none",
        background: "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        fontSize: 13,
        fontWeight: 500,
        color: "var(--ink-2)",
        opacity: disabled ? 0.3 : 1,
      }}
    >
      <Icon name={icon} size={14} /> {label}
    </button>
  );
}
