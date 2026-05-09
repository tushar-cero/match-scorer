"use client";

import { ReactNode, CSSProperties, Ref } from "react";

// ─── Sport Glyphs (custom SVG marks) ─────────────────────────
export function SportGlyph({
  sport,
  size = 40,
}: Readonly<{
  sport: string;
  size?: number;
}>) {
  if (sport === "tt")
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="16" r="11" fill="#0a0a0a" />
        <circle
          cx="20"
          cy="16"
          r="9"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.7"
        />
        <rect x="18.5" y="24" width="3" height="11" rx="1.5" fill="#0a0a0a" />
        <circle
          cx="28"
          cy="9"
          r="2"
          fill="#fff"
          stroke="#0a0a0a"
          strokeWidth="0.8"
        />
      </svg>
    );
  if (sport === "sn")
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="14" cy="22" r="6" fill="#5e3a1a" />
        <circle cx="22" cy="14" r="6" fill="#0a0a0a" />
        <circle cx="28" cy="26" r="6" fill="#c1452b" />
        <circle cx="13" cy="21" r="1.4" fill="rgba(255,255,255,0.4)" />
        <circle cx="21" cy="13" r="1.4" fill="rgba(255,255,255,0.3)" />
        <circle cx="27" cy="25" r="1.4" fill="rgba(255,255,255,0.4)" />
      </svg>
    );
  return null;
}

// ─── Inline Icons ─────────────────────────────────────────────
export function Icon({
  name,
  size = 18,
  color = "currentColor",
  stroke = 1.5,
}: Readonly<{
  name: string;
  size?: number;
  color?: string;
  stroke?: number;
}>) {
  const paths: Record<string, ReactNode> = {
    arrowLeft: <path d="M19 12H5M12 19l-7-7 7-7" />,
    arrowRight: <path d="M5 12h14M12 5l7 7-7 7" />,
    chevronRight: <path d="M9 18l6-6-6-6" />,
    check: <path d="M20 6L9 17l-5-5" />,
    x: <path d="M18 6L6 18M6 6l12 12" />,
    trophy: (
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 4h3v3a3 3 0 0 1-3 3M7 4H4v3a3 3 0 0 0 3 3" />
    ),
    bolt: <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />,
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
      </>
    ),
    undo: <path d="M3 7v6h6M3 13a9 9 0 1 0 3-7l-3 3" />,
    list: <path d="M3 6h18M3 12h18M3 18h18" />,
    shuffle: <path d="M16 3h5v5M4 20l17-17M21 16v5h-5M15 15l6 6M4 4l5 5" />,
    drag: (
      <>
        <circle cx="9" cy="6" r="1" />
        <circle cx="9" cy="12" r="1" />
        <circle cx="9" cy="18" r="1" />
        <circle cx="15" cy="6" r="1" />
        <circle cx="15" cy="12" r="1" />
        <circle cx="15" cy="18" r="1" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    dots: (
      <>
        <circle cx="12" cy="5" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="19" r="1.5" />
      </>
    ),
    edit: (
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    ),
    play: <path d="M5 3l14 9-14 9V3z" />,
    swap: <path d="M7 16V4m0 0L4 7m3-3l3 3M17 8v12m0 0l3-3m-3 3l-3-3" />,
    trash: (
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={true}
    >
      {paths[name] ?? null}
    </svg>
  );
}

// ─── Page Shell ───────────────────────────────────────────────
export function PageShell({
  children,
  style,
}: Readonly<{
  children: ReactNode;
  style?: CSSProperties;
}>) {
  return (
    <div
      style={{
        maxWidth: 390,
        margin: "0 auto",
        minHeight: "100vh",
        background: "var(--bg)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Page Header ─────────────────────────────────────────────
export function PageHeader({
  title,
  subtitle,
  onBack,
  action,
  large,
}: Readonly<{
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
  large?: boolean;
}>) {
  return (
    <div style={{ padding: large ? "60px 24px 8px" : "60px 16px 12px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 36,
        }}
      >
        <div style={{ width: 40 }}>
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back"
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                border: "none",
                background: "rgba(10,10,10,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Icon name="arrowLeft" size={18} />
            </button>
          )}
        </div>
        {!large && (
          <div
            style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}
          >
            {title}
          </div>
        )}
        <div style={{ width: 40, display: "flex", justifyContent: "flex-end" }}>
          {action}
        </div>
      </div>
      {large && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ marginTop: 6, fontSize: 15, color: "var(--ink-3)" }}>
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────
export function SectionHeader({
  title,
  trailing,
}: Readonly<{
  title: string;
  trailing?: ReactNode;
}>) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        margin: "24px 4px 10px",
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
        {title}
      </div>
      {trailing != null && (
        <div
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: 12,
            color: "var(--ink-4)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {trailing}
        </div>
      )}
    </div>
  );
}

// ─── Step Progress Bar ────────────────────────────────────────
export function StepBar({
  total,
  current,
}: Readonly<{
  total: number;
  current: number;
}>) {
  return (
    <div style={{ display: "flex", gap: 4, padding: "0 16px 8px" }}>
      {Array.from({ length: total }, (_, i) => i).map((i) => (
        <div
          key={`step-${i}`}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            background: i <= current ? "var(--ink)" : "rgba(10,10,10,0.08)",
            transition: "background 0.2s",
          }}
        />
      ))}
    </div>
  );
}

// ─── Glass Card ───────────────────────────────────────────────
export function GlassCard({
  children,
  style,
  onClick,
  className,
}: Readonly<{
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  className?: string;
}>) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      className={`glass ${className ?? ""}`}
      style={{
        borderRadius: 22,
        ...style,
        ...(onClick
          ? {
              cursor: "pointer",
              border: "none",
              textAlign: "left" as const,
              display: "block",
              width: "100%",
            }
          : {}),
      }}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}

// ─── Surface Row ──────────────────────────────────────────────
export function SurfaceRow({
  children,
  style,
}: Readonly<{
  children: ReactNode;
  style?: CSSProperties;
}>) {
  return (
    <div
      className="surface-card"
      style={{
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Primary Button ───────────────────────────────────────────
export function PrimaryBtn({
  children,
  onClick,
  disabled,
  large,
  style,
  className,
}: Readonly<{
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  large?: boolean;
  style?: CSSProperties;
  className?: string;
}>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: large ? 60 : 52,
        padding: "0 22px",
        borderRadius: large ? 18 : 16,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        fontWeight: 500,
        fontSize: large ? 17 : 16,
        letterSpacing: "-0.01em",
        background: disabled ? "rgba(10,10,10,0.2)" : "var(--ink)",
        color: "#fff",
        opacity: disabled ? 0.5 : 1,
        transition: "transform 0.12s, opacity 0.12s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Chip ─────────────────────────────────────────────────────
export function Chip({
  children,
  style,
}: Readonly<{
  children: ReactNode;
  style?: CSSProperties;
}>) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 28,
        padding: "0 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        background: "rgba(10,10,10,0.05)",
        color: "var(--ink-2)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Design Input ─────────────────────────────────────────────
export function DesignInput({
  style,
  ref,
  ...props
}: Readonly<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  style?: CSSProperties;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  min?: number;
  name?: string;
  ref?: Ref<HTMLInputElement>;
}>) {
  return (
    <input
      ref={ref}
      {...props}
      style={{
        width: "100%",
        height: 52,
        padding: "0 16px",
        borderRadius: 14,
        border: "1px solid var(--line)",
        background: "var(--surface)",
        color: "var(--ink)",
        fontFamily: "inherit",
        fontSize: 16,
        letterSpacing: "-0.01em",
        outline: "none",
        transition: "border-color 0.12s, box-shadow 0.12s",
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--ink)";
        e.currentTarget.style.boxShadow = "0 0 0 4px rgba(10,10,10,0.04)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--line)";
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

// ─── Label ────────────────────────────────────────────────────
export function Label({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      style={{
        fontSize: 13,
        color: "var(--ink-3)",
        fontWeight: 500,
        letterSpacing: "0.01em",
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

// ─── Number Picker ────────────────────────────────────────────
export function NumberPills({
  value,
  options,
  onChange,
}: Readonly<{
  value: number;
  options: number[];
  onChange: (v: number) => void;
}>) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          style={{
            height: 44,
            minWidth: 52,
            padding: "0 14px",
            borderRadius: 12,
            border: `0.5px solid ${o === value ? "var(--ink)" : "var(--line)"}`,
            background: o === value ? "var(--ink)" : "var(--surface)",
            color: o === value ? "#fff" : "var(--ink-2)",
            fontFamily: "var(--font-geist-mono)",
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
            fontVariantNumeric: "tabular-nums",
            transition: "all 0.12s",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
