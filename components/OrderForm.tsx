"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OrderForm(props: {
  serviceId: string;
  priceUSD: number;
  inputLabel: string;
  inputPlaceholder: string;
}) {
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) {
      setError("Add something for Solo to work on.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: props.serviceId, input }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "unknown" }));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const { id } = (await res.json()) as { id: string };
      router.push(`/checkout/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-sm text-[var(--color-ink-dim)] mb-2 block">
          {props.inputLabel}
        </span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={props.inputPlaceholder}
          rows={10}
          className="w-full panel p-4 mono text-sm leading-relaxed bg-[var(--color-bg)] focus:outline-none focus:border-[var(--color-accent-dim)]"
        />
      </label>
      {error && (
        <div className="text-sm text-[var(--color-danger)] mono">{error}</div>
      )}
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-[var(--color-ink-dim)]">
          You&apos;ll be routed to Locus Checkout to pay ${props.priceUSD.toFixed(2)} USDC.
        </span>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 rounded-md bg-[var(--color-accent)] text-[#08090b] font-semibold text-sm hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Creating order…" : `Pay $${props.priceUSD.toFixed(2)} USDC →`}
        </button>
      </div>
    </form>
  );
}
