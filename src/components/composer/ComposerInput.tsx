import { Entry, Message } from "../../types/dataset";

interface ComposerInputProps {
  activeEntry: Entry | null;
  editorState: EditorState;
  setEditorState: (s: EditorState) => void;
  onAddMessage: (msg: Message) => void;
  onUpdateMessage: (index: number, msg: Message) => void;
}

export interface EditorState {
  mode: "add" | "edit";
  editingIndex: number | null;
  content: string;
  thinking: string;
  editingContent: boolean;
}

export default function ComposerInput({
  activeEntry,
  editorState,
  setEditorState,
  onAddMessage,
  onUpdateMessage,
}: ComposerInputProps) {
  const isEditing = editorState.mode === "edit" && editorState.editingIndex !== null;

  const clear = () =>
    setEditorState({
      mode: "add",
      editingIndex: null,
      content: "",
      thinking: "",
      editingContent: true,
    });

  const handleSubmit = () => {
    if (!activeEntry) return;

    const last = activeEntry.messages[activeEntry.messages.length - 1];
    const nextRole =
      activeEntry.messages.length === 0
        ? "system"
        : last.role === "user"
        ? "model"
        : "user";

    const msg: Message =
      nextRole === "model"
        ? {
            role: "model",
            content: editorState.content,
            thinkingBlock: editorState.thinking || undefined,
          }
        : {
            role: nextRole,
            content: editorState.content,
          };

    if (isEditing && editorState.editingIndex !== null) {
      // preserve original role
      const original = activeEntry.messages[editorState.editingIndex];
      const updated: Message =
        original.role === "model"
          ? {
              role: "model",
              content: editorState.content,
              thinkingBlock: editorState.thinking || undefined,
            }
          : {
              role: original.role,
              content: editorState.content,
            };
      onUpdateMessage(editorState.editingIndex, updated);
      clear();
    } else {
      onAddMessage(msg);
      clear();
    }
  };

  return (
    <div className="bg-white border rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-xs text-slate-500">{isEditing ? "Editing message" : "Add:"}</p>
        <button
          onClick={() => setEditorState({ ...editorState, editingContent: true })}
          className={`text-xs px-2 py-1 rounded-md ${
            editorState.editingContent ? "bg-slate-900 text-white" : "bg-slate-100"
          }`}
        >
          Message
        </button>
        <button
          onClick={() => setEditorState({ ...editorState, editingContent: false })}
          className={`text-xs px-2 py-1 rounded-md ${
            !editorState.editingContent ? "bg-slate-900 text-white" : "bg-slate-100"
          }`}
        >
          Thinking block
        </button>
        {isEditing && (
          <p className="text-[10px] text-slate-400 ml-auto">
            Editing message #{(editorState.editingIndex ?? 0) + 1}
          </p>
        )}
      </div>

      <textarea
        placeholder={
          editorState.editingContent
            ? "Enter message content (Markdown supported)..."
            : "Enter thinking block (Markdown supported)..."
        }
        className="w-full border rounded-md p-2 text-sm min-h-[80px] focus:outline-none focus:ring-1 focus:ring-slate-300"
        value={editorState.editingContent ? editorState.content : editorState.thinking}
        onChange={(e) =>
          editorState.editingContent
            ? setEditorState({ ...editorState, content: e.target.value })
            : setEditorState({ ...editorState, thinking: e.target.value })
        }
        disabled={!activeEntry}
      />

      <div className="flex justify-end gap-2">
        {isEditing && (
          <button onClick={clear} className="px-3 py-1.5 rounded-md bg-slate-100 text-sm">
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!activeEntry}
          className="px-3 py-1.5 rounded-md bg-blue-500 text-white text-sm disabled:opacity-40"
        >
          {isEditing ? "Update message" : "Add to entry"}
        </button>
      </div>
    </div>
  );
}
