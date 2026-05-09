"use client";

import { useState } from "react";
import { Match } from "@/types";
import { useMatchStore } from "@/stores/match-store";
import { useToast } from "@/components/ui/Toast";
import { WinnerOverlay } from "./WinnerOverlay";
import { Icon } from "@/components/ui/primitives";

interface Props {
  readonly match: Match;
  readonly onBack: () => void;
}

export function LiveScoringTableTennis({ match, onBack }: Props) {
  const { addLiveAction, undoAction, currentMatch } = useMatchStore();
  const { showToast } = useToast();
  const [pulseSide, setPulseSide] = useState<"p1" | "p2" | null>(null);
  const [showLog, setShowLog] = useState(false);

  const m = currentMatch || match;
  const currentSet =
    m.sets.find((s) => s.status === "in-progress") || m.sets[0];
  const p1Score = currentSet?.player1Score ?? 0;
  const p2Score = currentSet?.player2Score ?? 0;
  const p1Sets = m.sets.filter((s) => s.winnerId === m.player1Id).length;
  const p2Sets = m.sets.filter((s) => s.winnerId === m.player2Id).length;
  const setsToWin = Math.ceil(m.sets.length / 2);

  const score = async (playerId: string, side: "p1" | "p2") => {
    await addLiveAction(playerId, "+1", 1, playerId);
    setPulseSide(side);
    setTimeout(() => setPulseSide(null), 320);
  };

  const sub = async (playerId: string) => {
    await addLiveAction(playerId, "subtract-1", -1, playerId);
  };

  const undo = async () => {
    if (m.liveActions.length === 0) return;
    await undoAction();
    showToast("Undone");
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
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top pill */}
      <div
        style={{
          position: "absolute",
          top: 56,
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
            gap: 10,
            padding: "6px 12px 6px 6px",
            borderRadius: 999,
          }}
        >
          <button
            onClick={onBack}
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              border: "none",
              background: "rgba(10,10,10,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Icon name="x" size={14} />
          </button>
          <div
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 12,
              color: "var(--ink-3)",
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            SET {currentSet?.setNumber ?? 1} · {m.config.pointsPerSet ?? 11} PTS
          </div>
        </div>
      </div>

      {/* Split */}
      <div style={{ display: "flex", flex: 1 }}>
        <PlayerHalf
          name={m.player1Name}
          score={p1Score}
          setsWon={p1Sets}
          setsToWin={setsToWin}
          pulsing={pulseSide === "p1"}
          side="left"
          onAdd={() => score(m.player1Id, "p1")}
          onSub={() => sub(m.player1Id)}
        />
        <div
          style={{ width: "0.5px", background: "var(--line)", flexShrink: 0 }}
        />
        <PlayerHalf
          name={m.player2Name}
          score={p2Score}
          setsWon={p2Sets}
          setsToWin={setsToWin}
          pulsing={pulseSide === "p2"}
          side="right"
          onAdd={() => score(m.player2Id, "p2")}
          onSub={() => sub(m.player2Id)}
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
        </div>
      </div>

      {/* Score log sheet */}
      {showLog && (
        <ScoreLogSheet
          actions={m.liveActions}
          p1Name={m.player1Name}
          p2Name={m.player2Name}
          p1Id={m.player1Id}
          onClose={() => setShowLog(false)}
        />
      )}
    </div>
  );
}

function PlayerHalf({
  name,
  score,
  setsWon,
  setsToWin,
  pulsing,
  side,
  onAdd,
  onSub,
}: Readonly<{
  name: string;
  score: number;
  setsWon: number;
  setsToWin: number;
  pulsing: boolean;
  side: "left" | "right";
  onAdd: () => void;
  onSub: () => void;
}>) {
  const bg = side === "left" ? "#fafaf8" : "#ffffff";
  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        background: bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Name + set dots */}
      <div style={{ padding: "100px 16px 10px", textAlign: "center" }}>
        <div
          style={{
            fontSize: 14,
            color: "var(--ink-3)",
            fontWeight: 500,
            marginBottom: 8,
          }}
        >
          {name}
        </div>
        <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
          {Array.from({ length: setsToWin }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: i < setsWon ? "var(--ink)" : "rgba(10,10,10,0.12)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Score */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className={pulsing ? "score-pulse" : ""}
          style={{
            fontFamily: "var(--font-geist)",
            fontVariantNumeric: "tabular-nums",
            fontWeight: 600,
            letterSpacing: "-0.05em",
            fontSize: 124,
            lineHeight: 1,
            color: "var(--ink)",
          }}
        >
          {score}
        </div>
      </div>

      {/* Tap hint */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 11,
          color: "var(--ink-4)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          pointerEvents: "none",
        }}
      >
        Tap to score
      </div>

      {/* Full-area tap button */}
      <button
        onClick={onAdd}
        aria-label={`Add point to ${name}`}
        style={{
          position: "absolute",
          inset: 0,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          zIndex: 1,
        }}
      />

      {/* −1 corner */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSub();
        }}
        style={{
          position: "absolute",
          bottom: 100,
          [side === "left" ? "left" : "right"]: 18,
          width: 40,
          height: 40,
          borderRadius: 999,
          background: "rgba(10,10,10,0.05)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 2,
        }}
      >
        <Icon name="undo" size={15} />
      </button>
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

function ScoreLogSheet({
  actions,
  p1Name,
  p2Name,
  p1Id,
  onClose,
}: Readonly<{
  actions: import("@/types").ScoringAction[];
  p1Name: string;
  p2Name: string;
  p1Id: string;
  onClose: () => void;
}>) {
  return (
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
      onClick={onClose}
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
        {actions.length === 0 && (
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
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[...actions].reverse().map((a) => (
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
                  {a.playerId === p1Id ? p1Name : p2Name}
                </span>
                <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>
                  {" "}
                  · {a.actionType}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: 13,
                  color: "var(--ink-3)",
                }}
              >
                Set {a.setNumber}
              </div>
            </div>
          ))}
        </div>
      </button>
    </button>
  );
}
