/**
 * Solo's ledger — a tiny JSON-file-backed store of orders + txns.
 *
 * For a hackathon we don't need a real DB. The agent runs single-process,
 * writes are infrequent (one per order step), and the demo benefits from a
 * file we can `git diff` or hand-edit for fixtures. We serialise the whole
 * file on every mutation (still fast enough at our scale).
 *
 * If you outgrow this, the public API of this module stays the same and only
 * the persistence layer changes.
 */

import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "solo.db.json");

export interface Order {
  id: string;
  serviceId: string;
  priceUSD: number;
  input: string;
  status:
    | "pending_payment"
    | "paid"
    | "fulfilling"
    | "delivered"
    | "refunded"
    | "failed";
  paymentRef?: string;
  paidAt?: number;
  deliverable?: string;
  deliveredAt?: number;
  costUSD: number;
  createdAt: number;
  trace?: TraceEvent[];
}

export type TraceLevel = "info" | "policy" | "spend" | "settle" | "deliver" | "warn" | "error";

export interface TraceEvent {
  ts: number;
  level: TraceLevel;
  message: string;
  detail?: string;
}

export interface Txn {
  id: string;
  orderId?: string;
  kind: "revenue" | "cost" | "settlement";
  direction: "in" | "out";
  vendor?: string;
  amountUSD: number;
  memo?: string;
  onchainRef?: string;
  createdAt: number;
}

interface DbShape {
  orders: Order[];
  txns: Txn[];
}

function load(): DbShape {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<DbShape>;
    return {
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      txns: Array.isArray(parsed.txns) ? parsed.txns : [],
    };
  } catch {
    return { orders: [], txns: [] };
  }
}

function save(db: DbShape): void {
  const tmp = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_PATH);
}

export function createOrder(args: {
  serviceId: string;
  priceUSD: number;
  input: string;
}): Order {
  const db = load();
  const order: Order = {
    id: randomUUID(),
    serviceId: args.serviceId,
    priceUSD: args.priceUSD,
    input: args.input,
    status: "pending_payment",
    costUSD: 0,
    createdAt: Date.now(),
  };
  db.orders.push(order);
  save(db);
  return order;
}

export function getOrder(id: string): Order | null {
  return load().orders.find((o) => o.id === id) ?? null;
}

function mutateOrder(id: string, mutator: (o: Order) => void): void {
  const db = load();
  const o = db.orders.find((o) => o.id === id);
  if (!o) return;
  mutator(o);
  save(db);
}

export function markOrderPaid(id: string, paymentRef: string): void {
  mutateOrder(id, (o) => {
    o.status = "paid";
    o.paidAt = Date.now();
    o.paymentRef = paymentRef;
  });
}

export function markOrderFulfilling(id: string): void {
  mutateOrder(id, (o) => {
    o.status = "fulfilling";
  });
}

export function markOrderDelivered(args: {
  id: string;
  deliverable: string;
  costUSD: number;
}): void {
  mutateOrder(args.id, (o) => {
    o.status = "delivered";
    o.deliverable = args.deliverable;
    o.deliveredAt = Date.now();
    o.costUSD = args.costUSD;
  });
}

export function markOrderFailed(id: string, reason: string): void {
  mutateOrder(id, (o) => {
    o.status = "failed";
    o.deliverable = `__FAILED__: ${reason}`;
  });
}

export function appendTrace(
  orderId: string,
  level: TraceLevel,
  message: string,
  detail?: string,
): void {
  mutateOrder(orderId, (o) => {
    o.trace = [
      ...(o.trace ?? []),
      { ts: Date.now(), level, message, detail },
    ];
  });
}

export function getTrace(orderId: string): TraceEvent[] {
  return load().orders.find((o) => o.id === orderId)?.trace ?? [];
}

export function recordTxn(args: {
  orderId?: string;
  kind: Txn["kind"];
  direction: Txn["direction"];
  vendor?: string;
  amountUSD: number;
  memo?: string;
  onchainRef?: string;
}): Txn {
  const db = load();
  const txn: Txn = {
    id: randomUUID(),
    orderId: args.orderId,
    kind: args.kind,
    direction: args.direction,
    vendor: args.vendor,
    amountUSD: args.amountUSD,
    memo: args.memo,
    onchainRef: args.onchainRef,
    createdAt: Date.now(),
  };
  db.txns.push(txn);
  save(db);
  return txn;
}

export function recentOrders(limit = 25): Order[] {
  const db = load();
  return [...db.orders]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

export function recentTxns(limit = 50): Txn[] {
  const db = load();
  return [...db.txns].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

export function pnlSummary(): {
  revenueUSD: number;
  costUSD: number;
  profitUSD: number;
  ordersDelivered: number;
  ordersPending: number;
  spendToday: number;
} {
  const db = load();
  let revenue = 0;
  let cost = 0;
  let spendToday = 0;
  const startOfDay = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();
  for (const t of db.txns) {
    if (t.direction === "in" && t.kind === "revenue") revenue += t.amountUSD;
    if (t.direction === "out" && (t.kind === "cost" || t.kind === "settlement")) {
      cost += t.amountUSD;
      if (t.createdAt >= startOfDay) spendToday += t.amountUSD;
    }
  }
  const delivered = db.orders.filter((o) => o.status === "delivered").length;
  const pending = db.orders.filter((o) =>
    ["paid", "fulfilling", "pending_payment"].includes(o.status),
  ).length;
  return {
    revenueUSD: revenue,
    costUSD: cost,
    profitUSD: revenue - cost,
    ordersDelivered: delivered,
    ordersPending: pending,
    spendToday,
  };
}
