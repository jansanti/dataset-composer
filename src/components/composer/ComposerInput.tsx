// src/components/composer/ComposerInput.tsx
import React, { useEffect, useMemo, useRef } from "react";
import { Entry, Message, RichSegment, SpecialToken } from "../../types/dataset";
import { htmlToSegments, segmentsToHtml, segmentsToPlain } from "../../utils/rich";

interface ComposerInputProps {
  activeEntry: Entry | null;
  editorState: EditorState;
  setEditorState: (s: EditorState) => void;
  onAddMessage: (msg: Message) => void;
  onUpdateMessage: (index: number, msg: Message) => void;
  specialTokens: SpecialToken[];
  reasoningEnabled: boolean;
  requestedInsertTokenId?: string | null;
  onConsumeRequestedInsertToken: () => void;
}

export interface EditorState {
  mode: "add" | "edit";
  editingIndex: number | null;
  content: string;
  thinking: string;
  editingContent: boolean;
  contentRich?: RichSegment[];
  thinkingRich?: RichSegment[];
}

export default function ComposerInput({
  activeEntry,
  editorState,
  setEditorState,
  onAddMessage,
  onUpdateMessage,
  specialTokens,
  reasoningEnabled,
  requestedInsertTokenId,
  onConsumeRequestedInsertToken,
}: ComposerInputProps) {
  const isEditing = editorState.mode === "edit" && editorState.editingIndex !== null;

  // When reasoning disabled → always treat as "message" mode
  const editingContent = reasoningEnabled ? editorState.editingContent : true;

  const editorRef = useRef<HTMLDivElement | null>(null);
  const skipNextSyncRef = useRef(false);

  const html = useMemo(() => {
    const segs = editingContent
      ? editorState.contentRich ?? [{ type: "text", value: editorState.content }]
      : editorState.thinkingRich ?? [{ type: "text", value: editorState.thinking }];

    return segmentsToHtml(segs, specialTokens);
  }, [
    editingContent,
    editorState.content,
    editorState.thinking,
    editorState.contentRich,
    editorState.thinkingRich,
    specialTokens,
  ]);

  // Keep contentEditable in sync with segments, but don't fight user typing
  useEffect(() => {
    if (!editorRef.current) return;

    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }

    if (editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html || "";
    }
  }, [html]);

  const onInput = () => {
    if (!editorRef.current) return;
    const segs = htmlToSegments(editorRef.current.innerHTML);

    // This update is a direct result of typing → skip next sync write
    skipNextSyncRef.current = true;

    if (editingContent) {
      const plain = segmentsToPlain(segs, specialTokens);
      setEditorState({
        ...editorState,
        contentRich: segs,
        content: plain,
      });
    } else {
      const plain = segmentsToPlain(segs, specialTokens);
      setEditorState({
        ...editorState,
        thinkingRich: segs,
        thinking: plain,
      });
    }
  };

  // Token insert requests from TokensPanel
  useEffect(() => {
    if (!requestedInsertTokenId || !editorRef.current) return;

    editorRef.current.focus();
    insertChip(requestedInsertTokenId);
    onConsumeRequestedInsertToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedInsertTokenId]);

  const insertChip = (tokenId: string) => {
    if (!editorRef.current) return;

    const t = specialTokens.find((x) => x.id === tokenId);
    const chip = document.createElement("span");

    chip.setAttribute("contenteditable", "false");
    chip.setAttribute("data-token-id", tokenId);
    chip.className =
      "inline-block px-1 py-0.5 text-[10px] rounded border border-amber-300 bg-amber-100 text-slate-800 select-none";
    chip.textContent = t?.name ?? "TOK";

    const sel = window.getSelection();
    let range = sel?.rangeCount ? sel.getRangeAt(0) : null;

    // If selection isn't inside the editor, put caret at the end
    if (!range || !editorRef.current.contains(range.commonAncestorContainer)) {
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }

    range!.deleteContents();
    range!.insertNode(chip);

    const space = document.createTextNode(" ");
    chip.after(space);

    // Move cursor after space
    const newRange = document.createRange();
    newRange.setStartAfter(space);
    newRange.setEndAfter(space);
    sel?.removeAllRanges();
    sel?.addRange(newRange);

    onInput();
  };

  const clear = () => {
    // 🔹 Hard-reset the DOM and sync flag so the box actually clears
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    skipNextSyncRef.current = false;

    setEditorState({
      mode: "add",
      editingIndex: null,
      content: "",
      thinking: "",
      editingContent: true,
      contentRich: [{ type: "text", value: "" }],
      thinkingRich: [{ type: "text", value: "" }],
    });
  };

  const handleSubmit = () => {
    if (!activeEntry) return;

    const segs = editingContent
      ? editorState.contentRich ?? [{ type: "text", value: editorState.content }]
      : editorState.thinkingRich ?? [{ type: "text", value: editorState.thinking }];

    const plain = segmentsToPlain(segs, specialTokens);

    const last = activeEntry.messages[activeEntry.messages.length - 1];
    const nextRole =
      activeEntry.messages.length === 0
        ? "system"
        : last.role === "user"
        ? "model"
        : "user";

    if (isEditing && editorState.editingIndex !== null) {
      const old = activeEntry.messages[editorState.editingIndex];

      const updated: Message =
        old.role === "model"
          ? reasoningEnabled
            ? {
                role: "model",
                content: editingContent ? plain : old.content,
                rich: editingContent ? segs : old.rich,
                thinkingBlock: !editingContent ? plain : old.thinkingBlock,
                thinkingRich: !editingContent ? segs : old.thinkingRich,
              }
            : {
                role: "model",
                content: plain,
                rich: segs,
              }
          : {
              role: old.role,
              content: plain,
              rich: segs,
            };

      onUpdateMessage(editorState.editingIndex, updated);
      clear();
      return;
    }

    const newMsg: Message =
      nextRole === "model"
        ? reasoningEnabled
          ? {
              role: "model",
              content: editingContent ? plain : "",
              rich: editingContent ? segs : [{ type: "text", value: "" }],
              thinkingBlock: !editingContent ? plain : undefined,
              thinkingRich: !editingContent ? segs : undefined,
            }
          : {
              role: "model",
              content: plain,
              rich: segs,
            }
        : {
            role: nextRole,
            content: plain,
            rich: segs,
          };

    onAddMessage(newMsg);
    clear();
  };

  return (
    <div className="bg-white border rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-xs text-slate-500">{isEditing ? "Editing" : "Add"}:</p>

        <button
          onClick={() => setEditorState({ ...editorState, editingContent: true })}
          className={`text-xs px-2 py-1 rounded-md ${
            editingContent ? "bg-slate-900 text-white" : "bg-slate-100"
          }`}
        >
          Message
        </button>

        {reasoningEnabled && (
          <button
            onClick={() => setEditorState({ ...editorState, editingContent: false })}
            className={`text-xs px-2 py-1 rounded-md ${
              !editingContent ? "bg-slate-900 text-white" : "bg-slate-100"
            }`}
          >
            Thinking block
          </button>
        )}
      </div>

      <div
        ref={editorRef}
        contentEditable={!!activeEntry}
        className="w-full border rounded-md p-2 text-sm min-h-[80px] focus:outline-none focus:ring-1 focus:ring-slate-300"
        onInput={onInput}
        onBlur={onInput}
      />

      <div className="flex justify-end gap-2">
        {isEditing && (
          <button
            onClick={clear}
            className="px-3 py-1.5 rounded-md bg-slate-100 text-sm"
          >
            Cancel
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={!activeEntry}
          className="px-3 py-1.5 rounded-md bg-blue-500 text-white text-sm disabled:opacity-40"
        >
          {isEditing ? "Update Message" : "Add to Entry"}
        </button>
      </div>
    </div>
  );
}
