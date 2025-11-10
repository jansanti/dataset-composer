# 🧠 Dataset Composer

**Dataset Composer** is a Next.js web app for building and managing structured AI training datasets with *chat-style message editing*.  
It’s designed for prompt engineers, AI researchers, and data annotation teams who want a **clean, visual interface** for creating multi-turn conversations — complete with message editing, reasoning blocks, export formats, and automatic persistence.

---

## 🚀 Features

✅ **Conversation Builder** — Easily create, edit, and organize multi-turn dialogues between user, model, and system roles.  
✅ **Categories / Folders** — Group entries into collapsible folders (e.g., “Math”, “Introductions”, etc.).  
✅ **Rich Markdown Rendering** — Supports headers, lists, code blocks, and tables inside messages.  
✅ **Editable Messages** — Double-click any message to modify its text or reasoning block.  
✅ **Import / Export** — Save and load datasets in both JSON and `.txt` formats.  
✅ **Autosave** — All data is automatically saved locally in your browser (persistent across refreshes).  
✅ **Clear Workspace** — Reset everything with a single click.  
✅ **Custom Tokens** — Define your own start/end, reasoning, and role tokens for dataset generation.

---

## 🧩 Tech Stack

- **Next.js 14**
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **React Markdown + Remark GFM**
- Local Storage for autosave persistence

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/dataset-composer.git
cd dataset-composer

# Install dependencies
npm install

# Run the dev server
npm run dev
````

Then open your browser at [http://localhost:3000](http://localhost:3000)

---

## 🧠 How to Use

1. **Start a new entry** — Click “+ Category” or “+ Entry” in the sidebar.
2. **Add messages** — Use the input area at the bottom to add user/model/system messages.
3. **Edit messages** — Double-click a message bubble to edit its text or reasoning block.
4. **Organize by category** — Create folders to group related conversations.
5. **Export data** — Click **Export (.json)** or **Export (.txt)** from the top toolbar.
6. **Import existing datasets** — Use the **Import** button to upload a previously exported JSON file.
7. **Clear workspace** — If you want to start over, click **Clear** and confirm.

---

## 💾 Data Persistence

All entries, categories, and settings are stored in **LocalStorage** under the key:

```
datasetComposerState_v1
```

Your data automatically reloads after a refresh — no backend required.

---

## 🧱 Export Formats

### JSON Format

Includes full metadata:

```json
{
  "version": 2,
  "categories": [...],
  "entries": [...],
  "settings": {...}
}
```

### TXT Format

Ideal for LLM training pipelines. Each entry is concatenated like:

```
<turn>user<start>Hello!</end>
<turn>model<start><reason>Thinking...</reason><answer>Hi there!</answer></end>
<|endoftext|>
```

---

## 🔧 Configuration

You can edit the default token values in the right-hand **Settings** panel:

* `turnToken`
* `startToken`
* `endToken`
* `reasoningToken`
* `answerToken`
* `systemToken`
* `userToken`
* `modelToken`

These will reflect in the `.txt` export output.

---

## 🧹 Clear Workspace

To reset everything:

1. Click **Clear** in the header bar.
2. Confirm the popup — this deletes all entries and categories.
3. Your workspace will start fresh with one default “Uncategorized” folder.

---

## 🧑‍💻 Development Tips

* All UI components are in `src/components/composer/`.
* Persistent state logic lives in `src/hooks/useDatasetState.ts`.
* Markdown rendering logic is isolated in `MarkdownBody.tsx`.
* You can theme or customize the UI easily via Tailwind.

---

## 📜 License

MIT License © 2025 [Your Name]

---

## 🌐 Demo

> 🧩 Try it live at: [https://datasetcomposer.jansanti.me](https://datasetcomposer.jansanti.me)