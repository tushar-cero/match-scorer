"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
}
interface ToastCtx {
  showToast: (msg: string, type?: Toast["type"]) => void;
}

const Ctx = createContext<ToastCtx>({ showToast: () => {} });

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const removeToast = useCallback((id: string) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: Toast["type"] = "info") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((p) => [...p, { id, message, type }]);
      setTimeout(() => removeToast(id), 2500);
    },
    [removeToast],
  );

  const ctxValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <Ctx.Provider value={ctxValue}>
      {children}
      <div
        style={{
          position: "fixed",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-fade-in-down glass"
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 500,
              color: t.type === "error" ? "#fff" : "var(--ink)",
              background: t.type === "error" ? "var(--warn)" : undefined,
              whiteSpace: "nowrap",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
