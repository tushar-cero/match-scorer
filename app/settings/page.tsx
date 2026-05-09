"use client";

import { useRouter } from "next/navigation";
import {
  PageShell,
  PageHeader,
  GlassCard,
  SectionHeader,
} from "@/components/ui/primitives";

export default function SettingsPage() {
  const router = useRouter();
  return (
    <PageShell>
      <PageHeader title="Settings" large onBack={() => router.back()} />
      <div style={{ padding: "8px 16px 48px" }}>
        <SectionHeader title="Supported sports" />
        <GlassCard style={{ borderRadius: 18, overflow: "hidden", padding: 0 }}>
          {[
            { sport: "tt", name: "Table Tennis", desc: "Best of 5 · 11 pts" },
            { sport: "sn", name: "Snooker", desc: "Best of 5 frames" },
          ].map((s, i, arr) => (
            <div
              key={s.sport}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderBottom:
                  i < arr.length - 1 ? "0.5px solid var(--line-2)" : "none",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "rgba(10,10,10,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {s.sport === "tt" ? "🏓" : "🎱"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15 }}>{s.name}</div>
              </div>
              <div style={{ fontSize: 14, color: "var(--ink-3)" }}>
                {s.desc}
              </div>
            </div>
          ))}
        </GlassCard>

        <SectionHeader title="About" />
        <GlassCard style={{ borderRadius: 18, overflow: "hidden", padding: 0 }}>
          {[
            { label: "Version", value: "1.0.0" },
            { label: "Storage", value: "IndexedDB (local)" },
            { label: "Account", value: "None needed" },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 16px",
                borderBottom:
                  i < arr.length - 1 ? "0.5px solid var(--line-2)" : "none",
              }}
            >
              <div style={{ fontSize: 15 }}>{row.label}</div>
              <div style={{ fontSize: 14, color: "var(--ink-3)" }}>
                {row.value}
              </div>
            </div>
          ))}
        </GlassCard>

        <div
          style={{
            textAlign: "center",
            marginTop: 32,
            fontSize: 12,
            color: "var(--ink-4)",
          }}
        >
          Local-first · No account needed
        </div>
      </div>
    </PageShell>
  );
}
