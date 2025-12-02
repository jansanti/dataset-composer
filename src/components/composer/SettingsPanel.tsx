// src/components/composer/SettingsPanel.tsx
import React from "react";
import { DatasetSettings } from "../../types/dataset";

export default function SettingsPanel({
  settings,
  onChange,
}: {
  settings: DatasetSettings;
  onChange: (s: DatasetSettings) => void;
}) {
  const update = (patch: Partial<DatasetSettings>) =>
    onChange({ ...settings, ...patch });

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-slate-700">Settings</h2>

      {/* Turn tokens */}
      <SettingsCard title="Turn Tokens">
        <div className="grid grid-cols-3 gap-2">
          <Field
            label="Turn"
            value={settings.turnToken}
            onChange={(v) => update({ turnToken: v })}
          />
          <Field
            label="Start"
            value={settings.startToken}
            onChange={(v) => update({ startToken: v })}
          />
          <Field
            label="End"
            value={settings.endToken}
            onChange={(v) => update({ endToken: v })}
          />
        </div>
      </SettingsCard>

      {/* Reasoning tokens */}
      <SettingsCard title="Reasoning Tokens">
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Reason"
            value={settings.reasoningToken}
            onChange={(v) => update({ reasoningToken: v })}
          />
          <Field
            label="Reason End"
            value={settings.reasoningEndToken}
            onChange={(v) => update({ reasoningEndToken: v })}
          />
        </div>
      </SettingsCard>

      {/* Answer tokens */}
      <SettingsCard title="Answer Tokens">
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Answer"
            value={settings.answerToken}
            onChange={(v) => update({ answerToken: v })}
          />
          <Field
            label="Answer End"
            value={settings.answerEndToken}
            onChange={(v) => update({ answerEndToken: v })}
          />
        </div>
      </SettingsCard>

      {/* Role tokens */}
      <SettingsCard title="Role Tokens">
        <div className="grid grid-cols-3 gap-2">
          <Field
            label="System"
            value={settings.systemToken}
            onChange={(v) => update({ systemToken: v })}
          />
          <Field
            label="User"
            value={settings.userToken}
            onChange={(v) => update({ userToken: v })}
          />
          <Field
            label="Model"
            value={settings.modelToken}
            onChange={(v) => update({ modelToken: v })}
          />
        </div>
      </SettingsCard>

      {/* Default system message */}
      <SettingsCard title="Default System Message">
        <p className="text-xs text-slate-500 mb-1">
          This will be automatically inserted as the first system message in every new
          entry.
        </p>
        <textarea
          className="w-full border rounded-md px-2 py-1 text-xs min-h-[80px] resize-y"
          value={settings.defaultSystemMessage}
          onChange={(e) => update({ defaultSystemMessage: e.target.value })}
          placeholder="e.g. You are a helpful assistant. Answer concisely using markdown."
        />
      </SettingsCard>

      {/* Reasoning toggle */}
      <SettingsCard>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-800">
              Reasoning / Thinking Blocks
            </p>
            <p className="text-xs text-slate-500">
              Disable this for models that don&apos;t support separate reasoning (only
              plain answers will be exported).
            </p>
          </div>
          <button
            onClick={() => update({ reasoningEnabled: !settings.reasoningEnabled })}
            className={`px-3 py-1.5 text-xs rounded-full border ${
              settings.reasoningEnabled
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-slate-100 text-slate-600 border-slate-300"
            }`}
          >
            {settings.reasoningEnabled ? "Enabled" : "Disabled"}
          </button>
        </div>
      </SettingsCard>
    </section>
  );
}

function SettingsCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-lg p-3 space-y-2">
      {title && (
        <h3 className="text-xs font-semibold uppercase text-slate-500">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-slate-600">{label}</span>
      <input
        className="border rounded-md px-2 py-1 text-xs bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
