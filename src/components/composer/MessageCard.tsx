import MarkdownBody from "./MarkdownBody";

export function SystemMessage({ content }: { content: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">System</p>
      <MarkdownBody>{content}</MarkdownBody>
    </div>
  );
}

export function UserMessage({ content }: { content: string }) {
  return (
    <div className="rounded-lg border bg-white p-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">User</p>
      <MarkdownBody>{content}</MarkdownBody>
    </div>
  );
}

export function ModelMessage({
  content,
  thinkingBlock,
}: {
  content: string;
  thinkingBlock?: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-2 space-y-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Model</p>
      {thinkingBlock ? (
        <div className="border-l-2 border-slate-200 pl-2">
          <MarkdownBody small>{thinkingBlock}</MarkdownBody>
        </div>
      ) : null}
      <MarkdownBody>{content}</MarkdownBody>
    </div>
  );
}
