export interface Category {
  id: string;
  name: string;
  collapsed: boolean;
}

export type Role = "system" | "user" | "model";

export interface Message {
  role: Role;
  content: string;
  thinkingBlock?: string;
}

export interface Entry {
  id: number;
  title?: string;
  categoryId: string;
  messages: Message[];
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
}

export interface SavedState {
  categories: Category[];
  entries: Entry[];
  activeEntryId: number | null;
  settings: DatasetSettings;
}

export interface ExportSchema {
  version: number;
  categories: Category[];
  entries: Entry[];
  settings?: Partial<DatasetSettings>;
}
