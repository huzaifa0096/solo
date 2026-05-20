/**
 * Minimal Markdown renderer — handles what the agent actually produces:
 *  - # / ## / ### headings
 *  - bullet lists with `- ` or `* `
 *  - numbered lists (`1. `)
 *  - **bold** and *italic* inline
 *  - `inline code` and fenced ```code blocks```
 *  - paragraph breaks
 *
 * Deliberately not a full CommonMark — we don't want to ship a heavy markdown
 * lib for a hackathon. This is enough for our service prompts.
 */

import { Fragment, type ReactNode } from "react";

export function Markdown({ source }: { source: string }) {
  return <div className="prose-solo">{render(source)}</div>;
}

function render(src: string): ReactNode[] {
  const blocks = src.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const out: ReactNode[] = [];
  let inCodeFence = false;
  let codeBuf: string[] = [];
  let key = 0;

  const flushCode = () => {
    if (codeBuf.length) {
      out.push(
        <pre
          key={key++}
          className="mono text-xs bg-[var(--color-bg)] border hairline rounded-md p-3 overflow-x-auto my-3"
        >
          {codeBuf.join("\n")}
        </pre>,
      );
      codeBuf = [];
    }
  };

  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;

    // Code fence block
    if (block.startsWith("```")) {
      const lines = block.split("\n");
      if (lines[0].startsWith("```") && lines[lines.length - 1].endsWith("```")) {
        codeBuf = lines.slice(1, -1);
        flushCode();
        continue;
      }
      // unclosed fence — treat literally
      inCodeFence = !inCodeFence;
      codeBuf.push(block);
      continue;
    }

    // Heading
    const h = block.match(/^(#{1,4})\s+(.+)$/);
    if (h) {
      const level = h[1].length;
      const text = h[2];
      const cls =
        level === 1
          ? "text-2xl font-semibold tracking-tight mt-1 mb-3"
          : level === 2
            ? "text-lg font-semibold tracking-tight mt-4 mb-2"
            : "text-sm uppercase tracking-widest text-[var(--color-ink-dim)] mt-4 mb-2";
      out.push(
        <div key={key++} className={cls}>
          {inline(text)}
        </div>,
      );
      continue;
    }

    // Lists
    const lines = block.split("\n");
    const allBullet = lines.every((l) => /^\s*[-*]\s+/.test(l));
    const allNumbered = lines.every((l) => /^\s*\d+\.\s+/.test(l));
    if (allBullet) {
      out.push(
        <ul key={key++} className="list-disc ml-6 my-2 space-y-1 text-sm leading-relaxed">
          {lines.map((l, i) => (
            <li key={i}>{inline(l.replace(/^\s*[-*]\s+/, ""))}</li>
          ))}
        </ul>,
      );
      continue;
    }
    if (allNumbered) {
      out.push(
        <ol key={key++} className="list-decimal ml-6 my-2 space-y-1 text-sm leading-relaxed">
          {lines.map((l, i) => (
            <li key={i}>{inline(l.replace(/^\s*\d+\.\s+/, ""))}</li>
          ))}
        </ol>,
      );
      continue;
    }

    out.push(
      <p key={key++} className="text-sm leading-relaxed my-2">
        {inline(block)}
      </p>,
    );
  }

  return out;
}

function inline(text: string): ReactNode {
  // We tokenize on **bold**, *italic*, `code` — order matters (code first).
  const parts: ReactNode[] = [];
  let i = 0;
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  let match: RegExpExecArray | null;
  let last = 0;
  let key = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) {
      parts.push(<Fragment key={key++}>{text.slice(last, match.index)}</Fragment>);
    }
    const tok = match[0];
    if (tok.startsWith("**")) {
      parts.push(
        <strong key={key++} className="text-[var(--color-ink)]">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else if (tok.startsWith("*")) {
      parts.push(
        <em key={key++} className="italic text-[var(--color-ink-dim)]">
          {tok.slice(1, -1)}
        </em>,
      );
    } else if (tok.startsWith("`")) {
      parts.push(
        <code
          key={key++}
          className="mono text-xs bg-[var(--color-bg)] border hairline rounded px-1 py-0.5"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    }
    last = match.index + tok.length;
  }
  if (last < text.length) {
    parts.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);
  }
  return parts;
}
