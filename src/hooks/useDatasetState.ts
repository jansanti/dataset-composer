// src/hooks/useDatasetState.ts
"use client";

import { useEffect, useState } from "react";
import {
  Category,
  Entry,
  Message,
  DatasetSettings,
  DatasetStateSnapshot,
  SpecialToken,
} from "../types/dataset";
import { buildTxtFromEntries } from "../utils/exportTxt";

const STORAGE_KEY = "dataset-composer-v1";

export const DEFAULT_CATEGORY_ID = "default-category";

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
  reasoningEnabled: true,
  defaultSystemMessage: "",
};

const defaultCategories: Category[] = [
  {
    id: DEFAULT_CATEGORY_ID,
    name: "Uncategorized",
  },
];

export function useDatasetState() {
  const [hydrated, setHydrated] = useState(false);

  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeEntry, setActiveEntryInternal] = useState<Entry | null>(null);
  const [settings, setSettings] = useState<DatasetSettings>(defaultSettings);
  const [specialTokens, setSpecialTokens] = useState<SpecialToken[]>([]);

  // ---------- Hydrate from localStorage ----------
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHydrated(true);
        return;
      }

      const parsed: DatasetStateSnapshot = JSON.parse(raw);

      setCategories(parsed.categories?.length ? parsed.categories : defaultCategories);
      setEntries(parsed.entries ?? []);
      setSettings({ ...defaultSettings, ...(parsed.settings ?? {}) });
      setSpecialTokens(parsed.specialTokens ?? []);
    } catch (err) {
      console.error("Failed to load dataset state:", err);
      setCategories(defaultCategories);
      setEntries([]);
      setSettings(defaultSettings);
      setSpecialTokens([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  // ---------- Autosave ----------
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined") return;

    const snapshot: DatasetStateSnapshot = {
      categories,
      entries,
      settings,
      specialTokens,
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (err) {
      console.error("Failed to save dataset state:", err);
    }
  }, [hydrated, categories, entries, settings, specialTokens]);

  // ---------- Active entry helper ----------
  const setActiveEntry = (entry: Entry | null) => {
    if (!entry) {
      setActiveEntryInternal(null);
      return;
    }
    const found = entries.find((e) => e.id === entry.id);
    setActiveEntryInternal(found ?? null);
  };

  useEffect(() => {
    if (!activeEntry) return;
    const updated = entries.find((e) => e.id === activeEntry.id) ?? null;
    setActiveEntryInternal(updated);
  }, [entries, activeEntry?.id]);

  // ---------- Category ops ----------
  const createCategory = (name: string) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : `cat-${Date.now()}-${Math.random()}`;
    const cat: Category = { id, name };
    setCategories((prev) => [...prev, cat]);
    return cat;
  };

  const updateCategory = (cat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
  };

  const deleteCategory = (cat: Category) => {
    if (cat.id === DEFAULT_CATEGORY_ID) return;

    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    setEntries((prev) =>
      prev.map((e) =>
        e.categoryId === cat.id ? { ...e, categoryId: DEFAULT_CATEGORY_ID } : e
      )
    );
  };

  // ---------- Entry ops ----------
  const createEntry = (categoryId?: string) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : `ent-${Date.now()}-${Math.random()}`;

    const initialMessages: Message[] = [];
    if (settings.defaultSystemMessage.trim()) {
      initialMessages.push({
        role: "system",
        content: settings.defaultSystemMessage,
        rich: [{ type: "text", value: settings.defaultSystemMessage }],
      });
    }

    const entry: Entry = {
      id,
      categoryId: categoryId ?? DEFAULT_CATEGORY_ID,
      title: "New Entry",
      messages: initialMessages,
      createdAt: new Date().toISOString(),
    };

    setEntries((prev) => [...prev, entry]);
    setActiveEntryInternal(entry);
    return entry;
  };

  const updateEntry = (entry: Entry) => {
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)));
  };

  const deleteEntry = (entryId: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    if (activeEntry?.id === entryId) {
      setActiveEntryInternal(null);
    }
  };

  // ---------- Message ops ----------
  const addMessageToActive = (msg: Message) => {
    if (!activeEntry) return;
    const updated: Entry = { ...activeEntry, messages: [...activeEntry.messages, msg] };
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setActiveEntryInternal(updated);
  };

  const updateMessageInActive = (index: number, msg: Message) => {
    if (!activeEntry) return;
    const messages = activeEntry.messages.map((m, i) => (i === index ? msg : m));
    const updated: Entry = { ...activeEntry, messages };
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setActiveEntryInternal(updated);
  };

  const deleteMessageInActive = (index: number) => {
    if (!activeEntry) return;
    const messages = activeEntry.messages.filter((_, i) => i !== index);
    const updated: Entry = { ...activeEntry, messages };
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setActiveEntryInternal(updated);
  };

  // ---------- Special tokens ----------
  const createSpecialToken = () => {
    const id = crypto.randomUUID ? crypto.randomUUID() : `tok-${Date.now()}-${Math.random()}`;
    const tok: SpecialToken = {
      id,
      name: "NEW_TOKEN",
      text: "",
      color: "bg-amber-100",
    };
    setSpecialTokens((prev) => [...prev, tok]);
    return tok;
  };

  const updateSpecialToken = (tok: SpecialToken) => {
    setSpecialTokens((prev) => prev.map((t) => (t.id === tok.id ? tok : t)));
  };

  const deleteSpecialToken = (id: string) => {
    setSpecialTokens((prev) => prev.filter((t) => t.id !== id));
  };

  // ---------- Export / Import ----------
  // NOTE: these now operate on the snapshot object, as Modals expects.

  const getExportJson = (): DatasetStateSnapshot => ({
    categories,
    entries,
    settings,
    specialTokens,
  });

  const getExportTxt = (): string =>
    buildTxtFromEntries({
      entries,
      specialTokens,
      reasoningEnabled: settings.reasoningEnabled,
      turnToken: settings.turnToken,
      startToken: settings.startToken,
      endToken: settings.endToken,
      reasoningToken: settings.reasoningToken,
      reasoningEndToken: settings.reasoningEndToken,
      answerToken: settings.answerToken,
      answerEndToken: settings.answerEndToken,
      systemToken: settings.systemToken,
      userToken: settings.userToken,
      modelToken: settings.modelToken,
    });

  const importJson = (data: DatasetStateSnapshot) => {
    setCategories(data.categories?.length ? data.categories : defaultCategories);
    setEntries(data.entries ?? []);
    setSettings({ ...defaultSettings, ...(data.settings ?? {}) });
    setSpecialTokens(data.specialTokens ?? []);
    setActiveEntryInternal(data.entries?.[0] ?? null);
    setHydrated(true);
  };

  const clearWorkspace = () => {
    setCategories(defaultCategories);
    setEntries([]);
    setSettings(defaultSettings);
    setSpecialTokens([]);
    setActiveEntryInternal(null);
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
    specialTokens,
    createSpecialToken,
    updateSpecialToken,
    deleteSpecialToken,
    getExportJson,   // now returns DatasetStateSnapshot
    getExportTxt,    // still returns string
    importJson,      // now accepts DatasetStateSnapshot
    clearWorkspace,
    DEFAULT_CATEGORY_ID,
  };
}
