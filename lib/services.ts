export type ServiceId = "code-review" | "resume-critique" | "market-scan";

export interface ServiceSpec {
  id: ServiceId;
  name: string;
  tagline: string;
  description: string;
  priceUSD: number;
  inputLabel: string;
  inputPlaceholder: string;
  inputKind: "code" | "resume" | "topic";
  systemPrompt: string;
  expectedTokens: number;
}

export const SERVICES: Record<ServiceId, ServiceSpec> = {
  "code-review": {
    id: "code-review",
    name: "AI Code Review",
    tagline: "Senior-engineer-grade review of any code snippet.",
    description:
      "Paste a function, route, or module. Solo returns a structured review: bugs, smells, security risks, and suggested rewrites.",
    priceUSD: 3,
    inputLabel: "Paste the code to review",
    inputPlaceholder: "function example() { /* ... */ }",
    inputKind: "code",
    expectedTokens: 4000,
    systemPrompt: `You are Solo, an autonomous AI engineer running your own code-review business.
For every paid order, deliver a tight, high-signal review with:
- A 1-sentence verdict (ship / iterate / rewrite)
- Concrete bugs and security issues, each with the offending line cited
- Smells and risks (with severity: low/med/high)
- A single highest-leverage rewrite suggestion
Be direct. Never pad. The customer paid in USDC — make the spend worth it.`,
  },
  "resume-critique": {
    id: "resume-critique",
    name: "Resume Critique",
    tagline: "Recruiter-grade critique for tech and operating roles.",
    description:
      "Paste a resume or job description + resume. Solo returns a critique: what works, what to cut, and a rewritten summary block.",
    priceUSD: 2,
    inputLabel: "Paste your resume (and target role if you have one)",
    inputPlaceholder: "Name | Title\\nExperience\\n...",
    inputKind: "resume",
    expectedTokens: 3000,
    systemPrompt: `You are Solo, an autonomous AI career coach running your own resume-critique business.
For every paid order, return:
- A scored verdict (1-10) with one-line reasoning
- The 3 highest-impact edits with before/after examples
- One rewritten summary block ready to paste into the resume
Tone: direct, kind, no fluff. The customer paid in USDC — they want signal, not validation.`,
  },
  "market-scan": {
    id: "market-scan",
    name: "Market Scan",
    tagline: "5-minute brief on any niche, market, or competitor.",
    description:
      "Drop a niche or company name. Solo returns a structured brief: market shape, top players, recent moves, and where the opening is.",
    priceUSD: 5,
    inputLabel: "What market, niche, or competitor should Solo scan?",
    inputPlaceholder: "e.g. 'AI invoice automation for SMBs' or 'Mercury vs Brex'",
    inputKind: "topic",
    expectedTokens: 5000,
    systemPrompt: `You are Solo, an autonomous AI analyst running your own market-research business.
For every paid order, return a tight brief with:
- Market shape: TAM cue, growth direction, primary buyer
- Top 3-5 players, one line each
- Recent moves (last 6-12 months) that matter
- Where the opening is — the gap a new entrant could exploit
Be specific. Never write "various" or "multiple" — name them. Customer paid in USDC; they want a brief, not a Wikipedia page.`,
  },
};

export const SERVICE_LIST: ServiceSpec[] = Object.values(SERVICES);

export function getService(id: string): ServiceSpec | null {
  return (SERVICES as Record<string, ServiceSpec | undefined>)[id] ?? null;
}
