import React from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

type CodeProps = React.HTMLAttributes<HTMLElement> & {
  inline?: boolean;
  children?: React.ReactNode;
};

export default function MarkdownBody({
  children,
  small = false,
}: {
  children: string;
  small?: boolean;
}) {
  const Code = ({ inline = false, children, ...props }: CodeProps) => {
    if (inline) {
      return (
        <code className="bg-slate-100 rounded px-1 py-0.5 text-xs" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="block bg-slate-100 rounded p-2 text-xs overflow-x-auto" {...props}>
        {children}
      </code>
    );
  };

  const components: Components = {
    h1: ({ node, ...props }) => (
      <h1 className={`${small ? "text-sm" : "text-lg"} font-semibold mt-2 mb-1`} {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className={`${small ? "text-sm" : "text-base"} font-semibold mt-2 mb-1`} {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className={`${small ? "text-sm" : "text-sm"} font-semibold mt-2 mb-1`} {...props} />
    ),
    p: ({ node, ...props }) => (
      <p className={`${small ? "text-xs" : "text-sm"} mb-1 leading-relaxed`} {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className={`${small ? "text-xs" : "text-sm"} ml-4 list-disc`} {...props} />
    ),
    code: Code,
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-slate-200 pl-3 italic text-slate-600 my-2"
        {...props}
      />
    ),
    table: ({ node, ...props }) => (
      <table className="text-sm border border-slate-200 my-2" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th className="border border-slate-200 bg-slate-50 px-2 py-1 text-left" {...props} />
    ),
    td: ({ node, ...props }) => <td className="border border-slate-200 px-2 py-1" {...props} />,
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
