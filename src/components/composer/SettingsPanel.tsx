import { DatasetSettings } from "../../types/dataset";

export default function SettingsPanel({
  settings,
  onChange,
}: {
  settings: DatasetSettings;
  onChange: (s: DatasetSettings) => void;
}) {
  const setField = (key: keyof DatasetSettings, value: string) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <section className="w-80 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-slate-700">Settings</h2>

      <div className="bg-white border rounded-lg p-3 space-y-2">
        <h3 className="text-xs font-semibold text-slate-600">Turn Tokens</h3>
        <div className="grid grid-cols-3 gap-2">
          <LabeledInput label="Turn" value={settings.turnToken} onChange={(v) => setField("turnToken", v)} />
          <LabeledInput label="Start" value={settings.startToken} onChange={(v) => setField("startToken", v)} />
          <LabeledInput label="End" value={settings.endToken} onChange={(v) => setField("endToken", v)} />
        </div>
      </div>

      <div className="bg-white border rounded-lg p-3 space-y-2">
        <h3 className="text-xs font-semibold text-slate-600">Reasoning Tokens</h3>
        <div className="grid grid-cols-2 gap-2">
          <LabeledInput
            label="Reasoning"
            value={settings.reasoningToken}
            onChange={(v) => setField("reasoningToken", v)}
          />
          <LabeledInput
            label="Reason End"
            value={settings.reasoningEndToken}
            onChange={(v) => setField("reasoningEndToken", v)}
          />
        </div>
      </div>

      <div className="bg-white border rounded-lg p-3 space-y-2">
        <h3 className="text-xs font-semibold text-slate-600">Answer Tokens</h3>
        <div className="grid grid-cols-2 gap-2">
          <LabeledInput label="Answer" value={settings.answerToken} onChange={(v) => setField("answerToken", v)} />
          <LabeledInput
            label="Answer End"
            value={settings.answerEndToken}
            onChange={(v) => setField("answerEndToken", v)}
          />
        </div>
      </div>

      <div className="bg-white border rounded-lg p-3 space-y-2">
        <h3 className="text-xs font-semibold text-slate-600">Role Tokens</h3>
        <div className="grid grid-cols-3 gap-2">
          <LabeledInput label="System" value={settings.systemToken} onChange={(v) => setField("systemToken", v)} />
          <LabeledInput label="User" value={settings.userToken} onChange={(v) => setField("userToken", v)} />
          <LabeledInput label="Model" value={settings.modelToken} onChange={(v) => setField("modelToken", v)} />
        </div>
      </div>
    </section>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="text-[11px] text-slate-500 space-y-1">
      <span>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-300"
      />
    </label>
  );
}
