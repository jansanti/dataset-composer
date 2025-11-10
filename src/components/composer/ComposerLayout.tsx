"use client";

import { Geist as Font } from "next/font/google";
import { useState } from "react";
import { useDatasetState } from "../../hooks/useDatasetState";
import { Category, Entry, Message } from "../../types/dataset";
import Sidebar from "./Sidebar";
import MessagesPane from "./MessagesPane";
import ComposerInput, { EditorState } from "./ComposerInput";
import SettingsPanel from "./SettingsPanel";
import Modals, { ComposerModalState } from "./Modals";

const font = Font({ subsets: ["latin"] });

export default function ComposerLayout() {
  const {
    hydrated,
    categories,
    entries,
    activeEntry,
    setActiveEntry,
    settings,
    setSettings,
    createCategory,
    updateCategory,
    deleteCategory,
    createEntry,
    updateEntry,
    deleteEntry,
    addMessageToActive,
    updateMessageInActive,
    deleteMessageInActive,
    getExportJson,
    getExportTxt,
    importJson,
    clearWorkspace,
    DEFAULT_CATEGORY_ID,
  } = useDatasetState();

  const [entrySearch, setEntrySearch] = useState<string>("");
  const [modal, setModal] = useState<ComposerModalState>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    mode: "add",
    editingIndex: null,
    content: "",
    thinking: "",
    editingContent: true,
  });

  if (!hydrated) {
    return (
      <main className={`${font.className} min-h-screen bg-slate-50 flex items-center justify-center`}>
        <p className="text-slate-400 text-sm">Loading workspace…</p>
      </main>
    );
  }

  return (
    <main className={`${font.className} min-h-screen bg-slate-50`}>
      {/* top bar */}
      <header className="w-full border-b bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-6">
          <h1 className="text-xl font-semibold">Dataset Composer</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setModal({ type: "import" })}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-sm hover:bg-slate-200 transition"
            >
              Import
            </button>
            <button
              onClick={() => setModal({ type: "export-json" })}
              className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition"
            >
              Export (.json)
            </button>
            <button
              onClick={() => setModal({ type: "export-txt" })}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-sm hover:bg-emerald-600 transition"
            >
              Export (.txt)
            </button>
            {/* NEW clear button */}
            <button
              onClick={() => setModal({ type: "clear-workspace" })}
              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm hover:bg-red-100 transition"
            >
              Clear
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex gap-4 py-4 px-6 h-[calc(100vh-56px)]">
        {/* LEFT */}
        <Sidebar
          categories={categories}
          entries={entries}
          activeEntry={activeEntry}
          onSelectEntry={(entry: Entry) => {
            setActiveEntry(entry);
            setEditorState({
              mode: "add",
              editingIndex: null,
              content: "",
              thinking: "",
              editingContent: true,
            });
          }}
          onCreateCategory={(name: string) => createCategory(name)}
          onRenameCategory={(cat: Category) => setModal({ type: "rename-category", category: cat })}
          onDeleteCategory={(cat: Category) => setModal({ type: "delete-category", category: cat })}
          onCreateEntry={(catId?: string) => createEntry(catId)}
          onRenameEntry={(entry: Entry) => setModal({ type: "rename-entry", entry })}
          onDeleteEntry={(entry: Entry) => deleteEntry(entry.id)}
          search={entrySearch}
          onSearch={(s: string) => setEntrySearch(s)}
          defaultCategoryId={DEFAULT_CATEGORY_ID}
        />

        {/* CENTER */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <MessagesPane
            activeEntry={activeEntry}
            settings={settings}
            onEditMessage={(index: number, msg: Message) =>
              setEditorState({
                mode: "edit",
                editingIndex: index,
                content: msg.content,
                thinking: msg.thinkingBlock ?? "",
                editingContent: true,
              })
            }
            onDeleteMessage={(index: number) => deleteMessageInActive(index)}
            categories={categories}
            onMoveEntry={(catId: string) => {
              if (!activeEntry) return;
              updateEntry({ ...activeEntry, categoryId: catId });
            }}
          />

          <ComposerInput
            activeEntry={activeEntry}
            editorState={editorState}
            setEditorState={setEditorState}
            onAddMessage={(msg: Message) => addMessageToActive(msg)}
            onUpdateMessage={(index: number, msg: Message) => updateMessageInActive(index, msg)}
          />
        </div>

        {/* RIGHT */}
        <SettingsPanel settings={settings} onChange={setSettings} />
      </div>

      <Modals
        modal={modal}
        setModal={setModal}
        categories={categories}
        entries={entries}
        onCreateCategory={(name: string) => createCategory(name)}
        onUpdateCategory={(cat: Category) => updateCategory(cat)}
        onDeleteCategory={(catId: string) => deleteCategory(catId)}
        onUpdateEntry={(entry: Entry) => updateEntry(entry)}
        onImport={(data) => importJson(data)}
        onExportJson={() => getExportJson()}
        onExportTxt={() => getExportTxt()}
        onClearWorkspace={() => clearWorkspace()}
      />
    </main>
  );
}
