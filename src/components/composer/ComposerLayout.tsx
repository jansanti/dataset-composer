// src/components/composer/ComposerLayout.tsx
"use client";

import { Geist } from "next/font/google";
import { useState } from "react";
import { useDatasetState, DEFAULT_CATEGORY_ID } from "../../hooks/useDatasetState";
import { Category, Entry, Message } from "../../types/dataset";
import Sidebar from "./Sidebar";
import MessagesPane from "./MessagesPane";
import ComposerInput, { EditorState } from "./ComposerInput";
import SettingsPanel from "./SettingsPanel";
import Modals, { ComposerModalState } from "./Modals";
import TokensPanel from "./TokensPanel";

const font = Geist({ subsets: ["latin"] });

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
    specialTokens,
    createSpecialToken,
    updateSpecialToken,
    deleteSpecialToken,
    getExportJson,
    getExportTxt,
    importJson,
    clearWorkspace,
  } = useDatasetState();

  const [entrySearch, setEntrySearch] = useState("");
  const [modal, setModal] = useState<ComposerModalState>(null);

  const [editorState, setEditorState] = useState<EditorState>({
    mode: "add",
    editingIndex: null,
    content: "",
    thinking: "",
    editingContent: true,
    contentRich: [{ type: "text", value: "" }],
    thinkingRich: [{ type: "text", value: "" }],
  });

  const [requestedInsertTokenId, setRequestedInsertTokenId] =
    useState<string | null>(null);

  const resetEditorState = () =>
    setEditorState({
      mode: "add",
      editingIndex: null,
      content: "",
      thinking: "",
      editingContent: true,
      contentRich: [{ type: "text", value: "" }],
      thinkingRich: [{ type: "text", value: "" }],
    });

  if (!hydrated) {
    return (
      <main
        className={`${font.className} min-h-screen bg-slate-50 flex items-center justify-center`}
      >
        <p className="text-slate-400 text-sm">Loading workspace…</p>
      </main>
    );
  }

  return (
    <main className={`${font.className} min-h-screen bg-slate-50`}>
      {/* Header */}
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
            <button
              onClick={() => setModal({ type: "clear-workspace" })}
              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm hover:bg-red-100 transition"
            >
              Clear
            </button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-[18rem,1fr,22rem] gap-4 py-4 px-6 h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <Sidebar
          categories={categories}
          entries={entries}
          activeEntry={activeEntry}
          onSelectEntry={(entry: Entry) => {
            setActiveEntry(entry);
            resetEditorState();
          }}
          onCreateCategory={(name: string) => createCategory(name)}
          onRenameCategory={(cat: Category) =>
            setModal({ type: "rename-category", category: cat })
          }
          onDeleteCategory={(cat: Category) =>
            setModal({ type: "delete-category", category: cat })
          }
          onCreateEntry={(catId?: string) => createEntry(catId)}
          onRenameEntry={(entry: Entry) => setModal({ type: "rename-entry", entry })}
          onDeleteEntry={(entry: Entry) => deleteEntry(entry.id)}
          search={entrySearch}
          onSearch={setEntrySearch}
          defaultCategoryId={DEFAULT_CATEGORY_ID}
        />

        {/* Messages + Composer */}
        <div className="flex flex-col gap-3 min-w-0">
          <MessagesPane
            activeEntry={activeEntry}
            settings={settings}
            specialTokens={specialTokens}
            onEditMessage={(index: number, msg: Message) =>
              setEditorState({
                mode: "edit",
                editingIndex: index,
                content: msg.content,
                thinking: msg.thinkingBlock ?? "",
                editingContent: true,
                contentRich: msg.rich ?? [{ type: "text", value: msg.content }],
                thinkingRich: msg.thinkingRich ?? [
                  { type: "text", value: msg.thinkingBlock ?? "" },
                ],
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
            onUpdateMessage={(index: number, msg: Message) =>
              updateMessageInActive(index, msg)
            }
            specialTokens={specialTokens}
            reasoningEnabled={settings.reasoningEnabled}
            requestedInsertTokenId={requestedInsertTokenId}
            onConsumeRequestedInsertToken={() => setRequestedInsertTokenId(null)}
          />
        </div>

        {/* Settings + Tokens (scrollable column) */}
        <div className="flex flex-col gap-4 min-h-0 overflow-y-auto pr-1">
          <SettingsPanel settings={settings} onChange={setSettings} />

          <TokensPanel
            tokens={specialTokens}
            onCreate={() => createSpecialToken()}
            onUpdate={(tok) => updateSpecialToken(tok)}
            onDelete={(id) => deleteSpecialToken(id)}
            onInsert={(id) => setRequestedInsertTokenId(id)}
          />
        </div>
      </div>

      <Modals
        modal={modal}
        setModal={setModal}
        categories={categories}
        entries={entries}
        onCreateCategory={createCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={(catId: string) => {
          const cat = categories.find((c) => c.id === catId);
          if (cat) deleteCategory(cat);
        }}
        onUpdateEntry={updateEntry}
        onImport={importJson}
        onExportJson={getExportJson}
        onExportTxt={getExportTxt}
        onClearWorkspace={clearWorkspace}
      />
    </main>
  );
}
