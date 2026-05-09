"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMatchStore } from "@/stores/match-store";
import { LiveScoringTableTennis } from "@/components/scoring/LiveScoringTableTennis";
import { LiveScoringSnooker } from "@/components/scoring/LiveScoringSnooker";

export default function LiveScoringPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentMatch, loadMatch } = useMatchStore();

  useEffect(() => {
    loadMatch(id);
  }, [id]);

  if (currentMatch?.id !== id) {
    return (
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
    );
  }

  const onBack = () => router.push(`/match/${id}`);

  if (currentMatch.sportId === "sn") {
    return <LiveScoringSnooker match={currentMatch} onBack={onBack} />;
  }

  return <LiveScoringTableTennis match={currentMatch} onBack={onBack} />;
}
