// src/hooks/useDatasetState.ts
import { useEffect, useState } from "react";
import {
  Category,
  Entry,
  Message,
  SavedState,
  DatasetSettings,
  ExportSchema,
} from "../types/dataset";
import { loadState, saveState } from "../utils/storage";
import { buildTxtFromEntries } from "../utils/exportTxt";

const STORAGE_KEY = "datasetComposerState_v1";
const DEFAULT_CATEGORY_ID = "cat-uncategorized";

const defaultSettings: DatasetSettings = {
  turnToken: "<turn>",
  startToken: "<start>",
  endToken: "<end>",
  reasoningToken: "<reason>",
  reasoningEndToken: "</reason>",
  answerToken: "<answer>",
  answerEndToken: "</answer>",
  systemToken: "instruct",
  userToken: "user",
  modelToken: "model",
};

export function useDatasetState() {
  const [categories, setCategories] = useState<Category[]>([
    { id: DEFAULT_CATEGORY_ID, name: "Uncategorized", collapsed: false },
  ]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeEntry, setActiveEntry] = useState<Entry | null>(null);
  const [settings, setSettings] = useState<DatasetSettings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);

  // hydrate
  useEffect(() => {
    const loaded = loadState(STORAGE_KEY);
    if (loaded) {
      setCategories(loaded.categories);
      setEntries(loaded.entries);
      setSettings(loaded.settings);
      if (loaded.activeEntryId) {
        const found = loaded.entries.find((e) => e.id === loaded.activeEntryId) ?? null;
        setActiveEntry(found);
      } else {
        setActiveEntry(loaded.entries[0] ?? null);
      }
    }
    setHydrated(true);
  }, []);

  // autosave
  useEffect(() => {
    if (!hydrated) return;
    const toSave: SavedState = {
      categories,
      entries,
      activeEntryId: activeEntry?.id ?? null,
      settings,
    };
    saveState(STORAGE_KEY, toSave);
  }, [hydrated, categories, entries, activeEntry, settings]);

  // category ops
  const createCategory = (name: string) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      collapsed: false,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (cat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
  };

  const deleteCategory = (catId: string) => {
    if (catId === DEFAULT_CATEGORY_ID) return;
    setEntries((prev) =>
      prev.map((e) => (e.categoryId === catId ? { ...e, categoryId: DEFAULT_CATEGORY_ID } : e))
    );
    setCategories((prev) => prev.filter((c) => c.id !== catId));
  };

  // entry ops
  const createEntry = (categoryId?: string) => {
    const id = entries.length + 1;
    const newEntry: Entry = {
      id,
      title: `Entry ${id}`,
      categoryId: categoryId ?? DEFAULT_CATEGORY_ID,
      messages: [],
    };
    setEntries((prev) => [...prev, newEntry]);
    setActiveEntry(newEntry);
  };

  const updateEntry = (entry: Entry) => {
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)));
    if (activeEntry?.id === entry.id) setActiveEntry(entry);
  };

  const deleteEntry = (entryId: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    if (activeEntry?.id === entryId) {
      setActiveEntry(null);
    }
  };

  // messages
  const addMessageToActive = (msg: Message) => {
    if (!activeEntry) return;
    const updated: Entry = {
      ...activeEntry,
      messages: [...activeEntry.messages, msg],
    };
    updateEntry(updated);
  };

  const updateMessageInActive = (index: number, msg: Message) => {
    if (!activeEntry) return;
    const updated: Entry = {
      ...activeEntry,
      messages: activeEntry.messages.map((m, i) => (i === index ? msg : m)),
    };
    updateEntry(updated);
  };

  const deleteMessageInActive = (index: number) => {
    if (!activeEntry) return;
    const updated: Entry = {
      ...activeEntry,
      messages: activeEntry.messages.filter((_, i) => i !== index),
    };
    updateEntry(updated);
  };

  // export
  const getExportJson = (): ExportSchema => ({
    version: 2,
    categories,
    entries,
    settings,
  });

  const getExportTxt = (): string =>
    buildTxtFromEntries({
      entries,
      ...settings,
    });

  // import
  const importJson = (data: ExportSchema) => {
    const fixedCats =
      data.categories && data.categories.length > 0
        ? data.categories
        : [{ id: DEFAULT_CATEGORY_ID, name: "Uncategorized", collapsed: false }];

    const fixedEntries =
      data.entries?.map((e) => ({
        ...e,
        categoryId: e.categoryId ?? DEFAULT_CATEGORY_ID,
      })) ?? [];

    setCategories(fixedCats);
    setEntries(fixedEntries);
    setActiveEntry(fixedEntries[0] ?? null);

    if (data.settings) {
      setSettings({
        ...defaultSettings,
        ...data.settings,
      });
    }
  };

  // ✅ clear workspace
  const clearWorkspace = () => {
    const defaultCat: Category = {
      id: DEFAULT_CATEGORY_ID,
      name: "Uncategorized",
      collapsed: false,
    };
    setCategories([defaultCat]);
    setEntries([]);
    setActiveEntry(null);
    setSettings(defaultSettings);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  return {
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
    clearWorkspace, // 👈 expose it
    DEFAULT_CATEGORY_ID,
  };
}
