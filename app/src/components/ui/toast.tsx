"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastTone = "default" | "success" | "error";

export type Toast = {
  id: number;
  title?: string;
  message: string;
  tone?: ToastTone;
  durationMs?: number;
  action?: {
    label: string;
    onClick: () => void | Promise<void>;
  };
};

type ToastContextValue = {
  push: (toast: Omit<Toast, "id">) => number;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const push = useCallback<ToastContextValue["push"]>(
    (toast) => {
      idRef.current += 1;
      const id = idRef.current;
      const next: Toast = {
        durationMs: 4500,
        tone: "default",
        ...toast,
        id,
      };
      setToasts((current) => [...current, next]);
      const duration = next.durationMs ?? 4500;
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-host" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  return (
    <div className={`toast tone-${toast.tone ?? "default"}`} role="status">
      <div className="toast-content">
        {toast.title ? <div className="toast-title">{toast.title}</div> : null}
        <div className="toast-msg">{toast.message}</div>
      </div>
      {toast.action ? (
        <button
          type="button"
          className="toast-action"
          onClick={() => {
            void toast.action?.onClick();
            onDismiss(toast.id);
          }}
        >
          {toast.action.label}
        </button>
      ) : null}
      <button
        type="button"
        className="toast-close"
        aria-label="Fermer la notification"
        onClick={() => onDismiss(toast.id)}
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast doit être utilisé dans un ToastProvider");
  }
  return ctx;
}
