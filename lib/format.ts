export function usd(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const v = Math.abs(amount);
  if (v >= 1) return `${sign}$${v.toFixed(2)}`;
  if (v >= 0.01) return `${sign}$${v.toFixed(3)}`;
  if (v === 0) return "$0.00";
  return `${sign}$${v.toFixed(5)}`;
}

export function relativeTime(ts: number): string {
  const delta = Date.now() - ts;
  if (delta < 60_000) return `${Math.max(1, Math.round(delta / 1000))}s ago`;
  if (delta < 3_600_000) return `${Math.round(delta / 60_000)}m ago`;
  if (delta < 86_400_000) return `${Math.round(delta / 3_600_000)}h ago`;
  return `${Math.round(delta / 86_400_000)}d ago`;
}

export function shortRef(ref: string | undefined, len = 10): string {
  if (!ref) return "—";
  if (ref.length <= len + 4) return ref;
  return `${ref.slice(0, len)}…${ref.slice(-4)}`;
}
