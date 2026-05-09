"use client";

import { useRouter } from "next/navigation";

export function WinnerOverlay({
  winnerName,
  matchId,
  tournamentId,
}: Readonly<{ winnerName: string; matchId?: string; tournamentId?: string }>) {
  const router = useRouter();
  const handleDone = () => {
    if (matchId) router.push(`/match/${matchId}`);
    else if (tournamentId) router.push(`/tournament/${tournamentId}`);
    else router.push("/");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "#0a0a0a",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Spotlight */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(80% 60% at 50% 35%, rgba(255,255,255,0.10), transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          paddingTop: 64,
          textAlign: "center",
          fontSize: 11,
          letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.55)",
          textTransform: "uppercase",
        }}
      >
        Match complete
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          padding: "0 24px",
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 999,
            background: "rgba(255,255,255,0.06)",
            border: "0.5px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 44,
          }}
        >
          🏆
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Winner
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {winnerName}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, padding: "0 24px 36px" }}>
        <button
          onClick={handleDone}
          style={{
            flex: 1,
            height: 60,
            borderRadius: 18,
            border: "none",
            background: "#fff",
            color: "#0a0a0a",
            fontSize: 17,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
