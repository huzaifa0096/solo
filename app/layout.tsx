import type { Metadata } from "next";
import "./globals.css";

const TITLE = "Solo — an AI that runs its own business, on Locus";
const DESCRIPTION =
  "An autonomous solopreneur on Locus. Customers pay USDC for a real AI service. The agent pays for its own Anthropic API calls from its Locus wallet. Live, on-chain, in public — and impossible without Locus's control layer.";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: TITLE,
    template: "%s · Solo",
  },
  description: DESCRIPTION,
  applicationName: "Solo",
  keywords: [
    "Locus",
    "Paygentic",
    "AI agent",
    "USDC",
    "Base",
    "machine economy",
    "agentic payments",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE,
    siteName: "Solo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b hairline">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <a href="/" className="flex items-center gap-3">
                <span className="dot" />
                <span className="font-semibold tracking-tight">solo</span>
                <span className="text-[var(--color-ink-dim)] text-xs hidden sm:inline mono">
                  AI-owned · USDC on Base
                </span>
              </a>
              <nav className="flex items-center gap-5 text-sm">
                <a className="hover:text-[var(--color-accent)]" href="/">
                  Services
                </a>
                <a className="hover:text-[var(--color-accent)]" href="/demo">
                  Policy
                </a>
                <a className="hover:text-[var(--color-accent)]" href="/dashboard">
                  P&amp;L
                </a>
                <a className="hover:text-[var(--color-accent)]" href="/story">
                  Why
                </a>
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t hairline mt-16">
            <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-[var(--color-ink-dim)] flex flex-wrap items-center justify-between gap-3">
              <span>
                solo runs autonomously. Built for{" "}
                <a
                  className="underline hover:text-[var(--color-accent)]"
                  href="https://paygentic-week4.devfolio.co/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Locus&apos; Paygentic Hackathon #4
                </a>
                .
              </span>
              <span className="mono flex items-center gap-3">
                <a
                  href="https://paywithlocus.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--color-accent)]"
                >
                  paywithlocus.com ↗
                </a>
                <span>·</span>
                <span>USDC · Base · MCP</span>
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
