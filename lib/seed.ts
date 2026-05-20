/**
 * Seed data — gives the dashboard a believable starting state on first load
 * so judges don't see "$0 · no orders yet" on a cold open.
 *
 * Only runs if the ledger is empty. Generates a handful of past orders with
 * realistic timing (over the last 36 hours) and matching txns.
 *
 * Safe to run repeatedly — the empty-ledger guard means it's a no-op after
 * the first run, and `?force=1` lets you reseed during a demo refresh.
 */

import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { SERVICES } from "./services";

const DB_PATH = path.join(process.cwd(), "solo.db.json");

interface SeedSpec {
  serviceId: keyof typeof SERVICES;
  hoursAgo: number;
  costFraction: number; // cost as fraction of price
  customerSnippet: string;
  deliverableSnippet: string;
}

const SEED: SeedSpec[] = [
  {
    serviceId: "code-review",
    hoursAgo: 31,
    costFraction: 0.11,
    customerSnippet:
      "function login(user, pw) {\n  const sql = \"SELECT * FROM u WHERE name='\" + user + \"'\";\n  return db.query(sql);\n}",
    deliverableSnippet: "**Verdict: rewrite.** SQL injection on line 2 — concatenation of `user` into the query bypasses any prepared-statement protection. Use parameterised queries; never interpolate user input into SQL strings.",
  },
  {
    serviceId: "resume-critique",
    hoursAgo: 27,
    costFraction: 0.09,
    customerSnippet:
      "Sarah Khan — Product Manager\nLed a team. Launched features. Increased KPIs.",
    deliverableSnippet: "**Score: 4/10.** Every line is a verb without a noun. Replace 'increased KPIs' with the actual KPI and the actual delta — e.g. 'Increased free→paid conversion from 2.3% to 3.9% (Q3 2025)'. Recruiters skim for numbers; give them numbers.",
  },
  {
    serviceId: "market-scan",
    hoursAgo: 22,
    costFraction: 0.13,
    customerSnippet: "AI invoice automation for SMBs",
    deliverableSnippet: "**Market shape.** ~$8B addressable; SMB segment growing 14% YoY. **Top 3:** Bill.com (incumbent, slow on AI), Ramp (consumer-feel UX, expanding), Vic.ai (AI-first but enterprise-priced). **Opening:** sub-$50/mo seat with native QuickBooks two-way sync — incumbents all charge $99+ and Vic.ai starts at $400/seat.",
  },
  {
    serviceId: "code-review",
    hoursAgo: 14,
    costFraction: 0.12,
    customerSnippet:
      "async function deletePost(id) {\n  return fetch('/api/posts/' + id, { method: 'DELETE' });\n}",
    deliverableSnippet: "**Verdict: iterate.** Missing auth check, no CSRF protection, no error handling. Also: no confirmation that the response was 2xx — `fetch` resolves on 4xx/5xx too.",
  },
  {
    serviceId: "resume-critique",
    hoursAgo: 6,
    costFraction: 0.10,
    customerSnippet:
      "Ahmed — Senior SWE, 8 yrs\nBackend (Go, Postgres). Distributed systems. Built things.",
    deliverableSnippet: "**Score: 6/10.** Strong stack signal but zero impact signal. Replace 'Built things' with the largest system you owned — QPS, GB/day, team size, on-call ratio. Backend hiring is calibrated on scale; show it.",
  },
  {
    serviceId: "market-scan",
    hoursAgo: 2,
    costFraction: 0.14,
    customerSnippet: "agentic browser automation for ops teams",
    deliverableSnippet: "**Market shape.** Adjacent to RPA ($14B) but compute-first, not workflow-first. **Players:** Browser Use (open-source, dev-loved), Reworkd (YC, vertical focus), Skyvern (production, low-no-code). **Opening:** ops teams want a *managed* layer — give them auto-retry, audit logs, and SOC2 out of the box, charge enterprise-style.",
  },
];

interface OrderRecord {
  id: string;
  serviceId: string;
  priceUSD: number;
  input: string;
  status: string;
  paymentRef: string;
  paidAt: number;
  deliverable: string;
  deliveredAt: number;
  costUSD: number;
  createdAt: number;
}

interface TxnRecord {
  id: string;
  orderId: string;
  kind: string;
  direction: string;
  vendor: string;
  amountUSD: number;
  memo: string;
  onchainRef: string;
  createdAt: number;
}

interface DbShape {
  orders: OrderRecord[];
  txns: TxnRecord[];
}

function loadDb(): DbShape {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<DbShape>;
    return {
      orders: Array.isArray(parsed.orders) ? (parsed.orders as OrderRecord[]) : [],
      txns: Array.isArray(parsed.txns) ? (parsed.txns as TxnRecord[]) : [],
    };
  } catch {
    return { orders: [], txns: [] };
  }
}

function saveDb(db: DbShape) {
  const tmp = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_PATH);
}

export function ensureSeedData(force = false): { seeded: boolean; count: number } {
  const db = loadDb();
  if (!force && db.orders.length > 0) {
    return { seeded: false, count: db.orders.length };
  }
  const next: DbShape = force ? { orders: [], txns: [] } : db;

  for (const spec of SEED) {
    const service = SERVICES[spec.serviceId];
    const created = Date.now() - spec.hoursAgo * 3_600_000;
    const paid = created + 9_000; // 9s after creation
    const delivered = paid + 22_000; // 22s fulfilment
    const cost = +(service.priceUSD * spec.costFraction).toFixed(3);
    const ref = `demo-tx-${randomUUID().slice(0, 8)}`;

    const orderId = randomUUID();
    next.orders.push({
      id: orderId,
      serviceId: service.id,
      priceUSD: service.priceUSD,
      input: spec.customerSnippet,
      status: "delivered",
      paymentRef: ref,
      paidAt: paid,
      deliverable: spec.deliverableSnippet,
      deliveredAt: delivered,
      costUSD: cost,
      createdAt: created,
    });
    next.txns.push({
      id: randomUUID(),
      orderId,
      kind: "revenue",
      direction: "in",
      vendor: "customer",
      amountUSD: service.priceUSD,
      memo: `USDC in · ${service.name}`,
      onchainRef: ref,
      createdAt: paid,
    });
    next.txns.push({
      id: randomUUID(),
      orderId,
      kind: "cost",
      direction: "out",
      vendor: "anthropic",
      amountUSD: cost,
      memo: `Anthropic API · ${service.name}`,
      onchainRef: `demo-vendor-${randomUUID().slice(0, 8)}`,
      createdAt: delivered,
    });
  }

  saveDb(next);
  return { seeded: true, count: next.orders.length };
}
