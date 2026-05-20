"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Status =
  | "pending_payment"
  | "paid"
  | "fulfilling"
  | "delivered"
  | "refunded"
  | "failed";

const STEPS: { key: Status; label: string }[] = [
  { key: "pending_payment", label: "Awaiting payment" },
  { key: "paid", label: "Payment received" },
  { key: "fulfilling", label: "Agent working" },
  { key: "delivered", label: "Delivered" },
];

export function OrderWatcher({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: Status;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const router = useRouter();

  useEffect(() => {
    if (status === "delivered" || status === "failed" || status === "refunded") {
      return;
    }
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`/api/orders/${orderId}/state`, {
          cache: "no-store",
        });
        if (!r.ok) return;
        const j = (await r.json()) as { status: Status };
        if (j.status !== status) {
          setStatus(j.status);
          if (j.status === "delivered" || j.status === "failed") {
            router.refresh();
          }
        }
      } catch {
        /* ignore */
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [orderId, status, router]);

  const activeIdx = Math.max(0, STEPS.findIndex((s) => s.key === status));
  const failed = status === "failed";

  return (
    <div className="panel p-6 mt-8">
      <div className="text-xs uppercase tracking-widest text-[var(--color-ink-dim)] mb-4">
        Status
      </div>
      <ol className="space-y-3">
        {STEPS.map((s, idx) => {
          const done = idx < activeIdx || status === "delivered";
          const active = idx === activeIdx && !done && !failed;
          return (
            <li key={s.key} className="flex items-center gap-3">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{
                  background: done
                    ? "var(--color-accent)"
                    : active
                      ? "var(--color-warn)"
                      : "var(--color-line)",
                  boxShadow: active
                    ? "0 0 0 4px color-mix(in oklab, var(--color-warn) 25%, transparent)"
                    : "none",
                }}
              />
              <span
                className={
                  done
                    ? "text-[var(--color-ink)]"
                    : active
                      ? "text-[var(--color-ink)]"
                      : "text-[var(--color-ink-dim)]"
                }
              >
                {s.label}
                {active && (
                  <span className="ml-2 text-xs mono text-[var(--color-warn)]">
                    in progress…
                  </span>
                )}
              </span>
            </li>
          );
        })}
        {failed && (
          <li className="flex items-center gap-3">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: "var(--color-danger)" }}
            />
            <span className="text-[var(--color-danger)]">Policy blocked</span>
          </li>
        )}
      </ol>
    </div>
  );
}
