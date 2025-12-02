// src/types/dataset.ts

export type Role = "system" | "user" | "model";

export type RichSegment =
  | { type: "text"; value: string }
  | { type: "token"; tokenId: string };

export interface Message {
  role: Role;
  content: string;
  thinkingBlock?: string;
  rich?: RichSegment[];
  thinkingRich?: RichSegment[];
}

export interface Entry {
  id: string;
  categoryId: string;
  title?: string;
  messages: Message[];
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  collapsed?: boolean;
}

export interface SpecialToken {
  id: string;
  name: string;
  text: string;
  color?: string;
}

export interface DatasetSettings {
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
  reasoningEnabled: boolean;
  defaultSystemMessage: string;
}

/**
 * Snapshot of the whole dataset used for import/export/autosave.
 */
export interface DatasetStateSnapshot {
  categories: Category[];
  entries: Entry[];
  settings: DatasetSettings;
  specialTokens: SpecialToken[];
}

/**
 * Backwards-compat names used in older parts of the code.
 * They are all the same shape as DatasetStateSnapshot.
 */
export type ExportSchema = DatasetStateSnapshot;
export type SavedState = DatasetStateSnapshot;
