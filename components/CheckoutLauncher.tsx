"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function CheckoutLauncher(props: {
  checkoutUrl: string;
  orderId: string;
  demo: boolean;
}) {
  const router = useRouter();
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`/api/orders/${props.orderId}/state`, {
          cache: "no-store",
        });
        if (!r.ok) return;
        const j = (await r.json()) as { status: string };
        if (j.status !== "pending_payment") {
          clearInterval(interval);
          router.replace(`/order/${props.orderId}`);
        }
      } catch {
        /* ignore polling errors */
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [polling, props.orderId, router]);

  async function launch() {
    if (props.demo) {
      // Demo: hit our simulator route, which marks paid + kicks off fulfilment.
      await fetch(props.checkoutUrl, { method: "POST" });
      setPolling(true);
      return;
    }
    window.open(props.checkoutUrl, "_blank", "noopener,noreferrer");
    setPolling(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={launch}
        className="w-full px-5 py-3 rounded-md bg-[var(--color-accent)] text-[#08090b] font-semibold hover:opacity-90"
      >
        {props.demo ? "Simulate payment →" : "Open Locus Checkout →"}
      </button>
      {polling && (
        <div className="text-xs text-[var(--color-ink-dim)] mono flex items-center gap-2">
          <span className="dot" /> waiting for settlement…
        </div>
      )}
    </div>
  );
}
