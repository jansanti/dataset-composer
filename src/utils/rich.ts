// src/utils/rich.ts
import { RichSegment, SpecialToken } from "../types/dataset";

/** Convert segments to plain text by expanding token segments using provided token list */
export function segmentsToPlain(segments: RichSegment[], tokens: SpecialToken[]): string {
  const map = new Map(tokens.map((t) => [t.id, t.text]));
  return segments
    .map((s) => (s.type === "text" ? s.value : map.get(s.tokenId) ?? ""))
    .join("");
}

/** Convert segments to simple HTML for contenteditable rendering (chips are non-editable spans) */
export function segmentsToHtml(segments: RichSegment[], tokens: SpecialToken[]): string {
  const map = new Map(tokens.map((t) => [t.id, t]));
  return segments
    .map((s) => {
      if (s.type === "text") {
        return escapeHtml(s.value);
      }
      const tok = map.get(s.tokenId);
      const label = tok?.name ?? "TOK";
      const color = tok?.color ?? "bg-amber-100";
      // minimal styles inline + data attribute
      return `<span contenteditable="false" data-token-id="${s.tokenId}" class="inline-block align-baseline rounded px-1 py-0.5 text-[10px] font-medium ${color} text-slate-800 border border-amber-300 select-none">${escapeHtml(
        label
      )}</span>`;
    })
    .join("");
}

/** Parse innerHTML from contenteditable into segments (non-editable chips become token segments) */
export function htmlToSegments(html: string): RichSegment[] {
  const div = document.createElement("div");
  div.innerHTML = html;

  const segments: RichSegment[] = [];
  function pushText(text: string) {
    if (!text) return;
    // merge with previous text segment when possible
    const prev = segments[segments.length - 1];
    if (prev && prev.type === "text") prev.value += text;
    else segments.push({ type: "text", value: text });
  }

  function walk(node: ChildNode) {
    if (node.nodeType === Node.TEXT_NODE) {
      pushText((node.textContent ?? "").replace(/\u00A0/g, " "));
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tokenId = el.getAttribute("data-token-id");
      if (tokenId) {
        segments.push({ type: "token", tokenId });
        return;
      }
      if (el.tagName === "BR") {
        pushText("\n");
        return;
      }
      // Recurse through children
      el.childNodes.forEach(walk);
      // Add newline for block-level elements
      if (isBlock(el)) pushText("\n");
    }
  }

  div.childNodes.forEach(walk);

  // collapse consecutive text segments & normalize newlines
  return collapseTextSegments(segments);
}

function isBlock(el: HTMLElement) {
  const display = window.getComputedStyle(el).display;
  return display === "block" || display === "list-item";
}

function collapseTextSegments(segments: RichSegment[]) {
  const out: RichSegment[] = [];
  for (const s of segments) {
    if (s.type === "text") {
      const val = s.value.replace(/\r/g, "");
      if (out.length && out[out.length - 1].type === "text") {
        (out[out.length - 1] as any).value += val;
      } else out.push({ type: "text", value: val });
    } else {
      out.push(s);
    }
  }
  return out;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
