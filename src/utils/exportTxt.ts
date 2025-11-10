import { Entry } from "../types/dataset";

export function buildTxtFromEntries({
  entries,
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
  let combined = "";
  entries.forEach((entry) => {
    entry.messages.forEach((m) => {
      if (m.role === "system") {
        combined += `${turnToken}${systemToken}${startToken}${m.content}${endToken}\n`;
      } else if (m.role === "user") {
        combined += `${turnToken}${userToken}${startToken}${m.content}${endToken}\n`;
      } else if (m.role === "model") {
        const thinking = m.thinkingBlock
          ? `${reasoningToken}${m.thinkingBlock}${reasoningEndToken}`
          : "";
        combined += `${turnToken}${modelToken}${startToken}${thinking}${answerToken}${m.content}${endToken}${answerEndToken}\n`;
      }
    });
    combined += "<|endoftext|>\n";
  });
  return combined;
}
