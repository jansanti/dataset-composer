// src/components/composer/MessagesPane.tsx
import React from "react";
import {
  Category,
  Entry,
  Message,
  DatasetSettings,
  SpecialToken,
  RichSegment,
} from "../../types/dataset";
import MarkdownBody from "./MarkdownBody";

interface MessagesPaneProps {
  activeEntry: Entry | null;
  settings: DatasetSettings;
  specialTokens: SpecialToken[];
  onEditMessage: (index: number, msg: Message) => void;
  onDeleteMessage: (index: number) => void;
  categories: Category[];
  onMoveEntry: (categoryId: string) => void;
}

const roleLabel: Record<Message["role"], string> = {
  system: "System",
  user: "User",
  model: "Model",
};

const roleColor: Record<Message["role"], string> = {
  system: "bg-slate-100",
  user: "bg-blue-50",
  model: "bg-emerald-50",
};

function TokenChip({ token }: { token?: SpecialToken }) {
  return (
    <span
      className={`inline-block align-baseline rounded px-1 py-0.5 text-[10px] font-medium ${
        token?.color ?? "bg-amber-100"
      } text-slate-800 border border-amber-300 mx-[2px]`}
    >
      {token?.name ?? "TOK"}
    </span>
  );
}

function RichView({
  segments,
  fallback,
  tokens,
  muted,
  small,
}: {
  segments?: RichSegment[];
  fallback: string;
  tokens: SpecialToken[];
  muted?: boolean;
  small?: boolean;
}) {
  const segs: RichSegment[] =
    segments && segments.length > 0
      ? segments
      : [{ type: "text", value: fallback }];

  const wrapperClass = muted
    ? "border-l-2 border-slate-300 pl-3 italic"
    : "";

  return (
    <div className={wrapperClass}>
      {segs.map((seg, i) => {
        if (seg.type === "text") {
          return (
            <MarkdownBody key={i} small={small}>
              {seg.value}
            </MarkdownBody>
          );
        }

        // seg.type === "token" here
        const tok = tokens.find((t) => t.id === seg.tokenId);
        return <TokenChip key={i} token={tok} />;
      })}
    </div>
  );
}

export default function MessagesPane({
  activeEntry,
  specialTokens,
  onEditMessage,
  onDeleteMessage,
  categories,
  onMoveEntry,
}: MessagesPaneProps) {
  if (!activeEntry) {
    return (
      <div className="flex-1 bg-white border rounded-lg flex items-center justify-center text-slate-400 text-sm">
        No entry selected
      </div>
    );
  }

  const currentCategory = categories.find((c) => c.id === activeEntry.categoryId);

  return (
    <div className="flex-1 bg-white border rounded-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b px-4 py-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-800">
            {activeEntry.title ?? `Entry ${activeEntry.id}`}
          </p>
          {currentCategory && (
            <p className="text-xs text-slate-500">
              In <span className="font-medium">{currentCategory.name}</span>
            </p>
          )}
        </div>

        <select
          value={activeEntry.categoryId}
          onChange={(e) => onMoveEntry(e.target.value)}
          className="text-xs border rounded-md px-2 py-1 bg-white"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {activeEntry.messages.length === 0 ? (
          <p className="text-xs text-slate-400">No messages yet. Add one below.</p>
        ) : (
          activeEntry.messages.map((m, index) => (
            <div
              key={index}
              className={`rounded-lg p-3 border border-slate-200 ${roleColor[m.role]}`}
            >
              <div className="flex justify-between mb-1">
                <p className="text-[11px] font-semibold">{roleLabel[m.role]}</p>

                <div className="flex gap-1">
                  <button
                    onClick={() => onEditMessage(index, m)}
                    className="text-[10px] px-2 py-0.5 rounded bg-white border hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteMessage(index)}
                    className="text-[10px] px-2 py-0.5 rounded bg-red-50 border border-red-100 text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Thinking block (if present) */}
              {m.thinkingBlock || (m.thinkingRich && m.thinkingRich.length > 0) ? (
                <RichView
                  segments={m.thinkingRich}
                  fallback={m.thinkingBlock ?? ""}
                  tokens={specialTokens}
                  muted
                  small
                />
              ) : null}

              {/* Main content */}
              <RichView
                segments={m.rich}
                fallback={m.content}
                tokens={specialTokens}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
