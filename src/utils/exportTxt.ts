import { Entry, SpecialToken } from "../types/dataset";
import { segmentsToPlain } from "./rich";

export function buildTxtFromEntries({
  entries,
  specialTokens,
  reasoningEnabled,
  turnToken,
  startToken,
  endToken,
  reasoningToken,
  reasoningEndToken,
  answerToken,
  answerEndToken,
  systemToken,
  userToken,
  modelToken,
}: {
  entries: Entry[];
  specialTokens: SpecialToken[];
  reasoningEnabled: boolean;
  turnToken: string;
  startToken: string;
  endToken: string;
  reasoningToken: string;
  reasoningEndToken: string;
  answerToken: string;
  answerEndToken: string;
  systemToken: string;
  userToken: string;
  modelToken: string;
}) {
  let txt = "";

  for (const entry of entries) {
    for (const m of entry.messages) {
      if (m.role === "system") {
        const text = m.rich ? segmentsToPlain(m.rich, specialTokens) : m.content;
        txt += `${turnToken}${systemToken}${startToken}${text}${endToken}\n`;
      }

      if (m.role === "user") {
        const text = m.rich ? segmentsToPlain(m.rich, specialTokens) : m.content;
        txt += `${turnToken}${userToken}${startToken}${text}${endToken}\n`;
      }

      if (m.role === "model") {
        const think = m.thinkingRich
          ? segmentsToPlain(m.thinkingRich, specialTokens)
          : m.thinkingBlock ?? "";

        const out = m.rich
          ? segmentsToPlain(m.rich, specialTokens)
          : m.content;

        if (reasoningEnabled) {
          const t = think
            ? `${reasoningToken}${think}${reasoningEndToken}`
            : "";

          txt += `${turnToken}${modelToken}${startToken}${t}${answerToken}${out}${endToken}${answerEndToken}\n`;
        } else {
          txt += `${turnToken}${modelToken}${startToken}${out}${endToken}\n`;
        }
      }
    }

    txt += "<|endoftext|>\n";
  }

  return txt;
}
