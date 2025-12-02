import { SpecialToken } from "../../types/dataset";
import React, { useState } from "react";

export default function TokensPanel({
  tokens,
  onCreate,
  onUpdate,
  onDelete,
  onInsert,
}: {
  tokens: SpecialToken[];
  onCreate: () => void;
  onUpdate: (tok: SpecialToken) => void;
  onDelete: (id: string) => void;
  onInsert: (id: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const sorted = [...tokens].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-slate-700">Special Tokens</h2>

      <div className="bg-white border rounded-lg p-3 flex flex-col h-72">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Insert non-editable chips into messages.
          </p>
          <button
            onClick={onCreate}
            className="text-xs px-2 py-1 rounded bg-slate-900 text-white"
          >
            + Add
          </button>
        </div>

        <div className="mt-2 flex-1 overflow-y-auto pr-1 space-y-2">
          {sorted.length === 0 ? (
            <p className="text-xs text-slate-400">No tokens yet.</p>
          ) : (
            sorted.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 border rounded-md px-2 py-1 bg-slate-50"
              >
                {editing === t.id ? (
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      defaultValue={t.name}
                      onChange={(e) => (t.name = e.target.value)}
                      className="border rounded px-1 py-1 text-xs"
                    />
                    <input
                      defaultValue={t.text}
                      onChange={(e) => (t.text = e.target.value)}
                      className="border rounded px-1 py-1 text-xs"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <span
                      className={`inline-block rounded px-1 py-0.5 text-[10px] font-medium ${
                        t.color ?? "bg-amber-100"
                      } border border-amber-300`}
                    >
                      {t.name}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-2">
                      → {t.text || <em className="text-slate-400">empty</em>}
                    </span>
                  </div>
                )}

                {editing === t.id ? (
                  <>
                    <button
                      onClick={() => {
                        onUpdate({ ...t });
                        setEditing(null);
                      }}
                      className="text-[10px] px-2 py-0.5 bg-slate-900 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="text-[10px] px-2 py-0.5 bg-slate-100 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditing(t.id)}
                      className="text-[10px] px-2 py-0.5 bg-slate-100 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(t.id)}
                      className="text-[10px] px-2 py-0.5 bg-red-50 text-red-600 rounded"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => onInsert(t.id)}
                      className="text-[10px] px-2 py-0.5 bg-emerald-500 text-white rounded"
                    >
                      Insert
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
