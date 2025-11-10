import { Category, Entry, Message } from "../../types/dataset";
import { SystemMessage, UserMessage, ModelMessage } from "./MessageCard";

interface MessagesPaneProps {
  activeEntry: Entry | null;
  settings: any; // not used here, but you can display info
  onEditMessage: (index: number, msg: Message) => void;
  onDeleteMessage: (index: number) => void;
  categories: Category[];
  onMoveEntry: (catId: string) => void;
}

export default function MessagesPane({
  activeEntry,
  onEditMessage,
  onDeleteMessage,
  categories,
  onMoveEntry,
}: MessagesPaneProps) {
  return (
    <div className="flex-1 flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-700">
            {activeEntry
              ? `${activeEntry.title ?? `Entry ${activeEntry.id}`} Messages`
              : "No entry selected"}
          </h2>
          {activeEntry && (
            <select
              value={activeEntry.categoryId}
              onChange={(e) => onMoveEntry(e.target.value)}
              className="text-xs border rounded px-2 py-1 bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
        {activeEntry && (
          <p className="text-xs text-slate-400">
            Next role:{" "}
            <span className="font-mono">
              {activeEntry.messages.length === 0
                ? "system"
                : activeEntry.messages[activeEntry.messages.length - 1].role === "user"
                ? "model"
                : "user"}
            </span>
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-white border rounded-lg p-3 space-y-3">
        {activeEntry ? (
          activeEntry.messages.length > 0 ? (
            activeEntry.messages.map((m, i) => (
              <div key={i} className="relative group">
                {m.role === "system" ? (
                  <SystemMessage content={m.content} />
                ) : m.role === "user" ? (
                  <UserMessage content={m.content} />
                ) : (
                  <ModelMessage content={m.content} thinkingBlock={m.thinkingBlock} />
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => onEditMessage(i, m)}
                    className="text-[10px] px-2 py-0.5 bg-slate-100 rounded hover:bg-slate-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteMessage(i)}
                    className="text-[10px] px-2 py-0.5 bg-red-50 text-red-500 rounded hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">This entry has no messages yet.</p>
          )
        ) : (
          <p className="text-xs text-slate-400">Select an entry to view messages.</p>
        )}
      </div>
    </div>
  );
}
