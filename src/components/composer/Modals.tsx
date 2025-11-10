import React, { useRef, useState } from "react";
import { Category, Entry, ExportSchema } from "../../types/dataset";

export type ComposerModalState =
  | { type: "import" }
  | { type: "export-json" }
  | { type: "export-txt" }
  | { type: "rename-category"; category: Category }
  | { type: "delete-category"; category: Category }
  | { type: "rename-entry"; entry: Entry }
  | { type: "clear-workspace" }
  | null;

interface ModalsProps {
  modal: ComposerModalState;
  setModal: (m: ComposerModalState) => void;
  categories: Category[];
  entries: Entry[];
  onCreateCategory: (name: string) => void;
  onUpdateCategory: (cat: Category) => void;
  onDeleteCategory: (catId: string) => void;
  onUpdateEntry: (entry: Entry) => void;
  onImport: (data: ExportSchema) => void;
  onExportJson: () => ExportSchema;
  onExportTxt: () => string;
  onClearWorkspace: () => void;
}

export default function Modals({
  modal,
  setModal,
  onUpdateCategory,
  onDeleteCategory,
  onUpdateEntry,
  onImport,
  onExportJson,
  onExportTxt,
  onClearWorkspace,
}: ModalsProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [filename, setFilename] = useState("dataset-composer.json");
  const [textFilename, setTextFilename] = useState("dataset-composer.txt");
  const [renameValue, setRenameValue] = useState("");

  if (!modal) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-4 space-y-3">
        {/* IMPORT */}
        {modal.type === "import" && (
          <>
            <h3 className="text-sm font-semibold">Import dataset</h3>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="w-full text-sm"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                try {
                  const parsed = JSON.parse(text) as ExportSchema;
                  onImport(parsed);
                  setModal(null);
                } catch {
                  alert("Invalid JSON file");
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="text-sm px-3 py-1.5">
                Close
              </button>
            </div>
          </>
        )}

        {/* EXPORT JSON */}
        {modal.type === "export-json" && (
          <>
            <h3 className="text-sm font-semibold">Export dataset (.json)</h3>
            <label className="text-xs text-slate-500">File name</label>
            <input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full border rounded-md px-2 py-1 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="text-sm px-3 py-1.5">
                Cancel
              </button>
              <button
                onClick={() => {
                  const data = onExportJson();
                  const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = filename.endsWith(".json") ? filename : `${filename}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  setModal(null);
                }}
                className="text-sm px-3 py-1.5 bg-blue-500 text-white rounded-md"
              >
                Export
              </button>
            </div>
          </>
        )}

        {/* EXPORT TXT */}
        {modal.type === "export-txt" && (
          <>
            <h3 className="text-sm font-semibold">Export dataset (.txt)</h3>
            <label className="text-xs text-slate-500">File name</label>
            <input
              value={textFilename}
              onChange={(e) => setTextFilename(e.target.value)}
              className="w-full border rounded-md px-2 py-1 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="text-sm px-3 py-1.5">
                Cancel
              </button>
              <button
                onClick={() => {
                  const txt = onExportTxt();
                  const blob = new Blob([txt], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = textFilename.endsWith(".txt")
                    ? textFilename
                    : `${textFilename}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  setModal(null);
                }}
                className="text-sm px-3 py-1.5 bg-emerald-500 text-white rounded-md"
              >
                Export
              </button>
            </div>
          </>
        )}

        {/* RENAME CATEGORY */}
        {modal.type === "rename-category" && (
          <>
            <h3 className="text-sm font-semibold">Rename category</h3>
            <input
              value={renameValue || modal.category.name}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full border rounded-md px-2 py-1 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="text-sm px-3 py-1.5">
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateCategory({ ...modal.category, name: renameValue || modal.category.name });
                  setRenameValue("");
                  setModal(null);
                }}
                className="text-sm px-3 py-1.5 bg-slate-900 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </>
        )}

        {/* DELETE CATEGORY */}
        {modal.type === "delete-category" && (
          <>
            <h3 className="text-sm font-semibold">Delete category?</h3>
            <p className="text-xs text-slate-500">
              Entries in this category will be moved to “Uncategorized”.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="text-sm px-3 py-1.5">
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteCategory(modal.category.id);
                  setModal(null);
                }}
                className="text-sm px-3 py-1.5 bg-red-500 text-white rounded-md"
              >
                Delete
              </button>
            </div>
          </>
        )}

        {/* RENAME ENTRY */}
        {modal.type === "rename-entry" && (
          <>
            <h3 className="text-sm font-semibold">Rename entry</h3>
            <input
              value={renameValue || modal.entry.title || ""}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full border rounded-md px-2 py-1 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="text-sm px-3 py-1.5">
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateEntry({ ...modal.entry, title: renameValue || modal.entry.title });
                  setRenameValue("");
                  setModal(null);
                }}
                className="text-sm px-3 py-1.5 bg-slate-900 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </>
        )}

        {/* CLEAR WORKSPACE */}
        {modal.type === "clear-workspace" && (
          <>
            <h3 className="text-sm font-semibold text-red-600">Clear workspace?</h3>
            <p className="text-xs text-slate-500">
              This will delete all entries and categories (except “Uncategorized”) and clear the
              saved copy in your browser. This can’t be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="text-sm px-3 py-1.5">
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearWorkspace();
                  setModal(null);
                }}
                className="text-sm px-3 py-1.5 bg-red-500 text-white rounded-md"
              >
                Yes, clear
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
