"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { getTechIconClass } from "@/shared/lib/techIcons";

/**
 * Transforms inline `@[TechName]` strings into styled badge components
 */
function renderWithTechBadges(node) {
  if (typeof node === "string") {
    if (!node.includes("@[")) return node;
    const parts = [];
    const regex = /@\[([^\]]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(node)) !== null) {
      if (match.index > lastIndex) {
        parts.push(node.slice(lastIndex, match.index));
      }
      const techName = match[1].trim();
      const iconClass = getTechIconClass(techName);
      parts.push(
        <span
          key={`${match.index}-${techName}`}
          className="inline-flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-700/80 px-2 py-0.5 rounded-md text-zinc-200 text-xs font-semibold select-all capitalize mx-1 align-baseline shadow-sm"
        >
          {iconClass && <i className={`${iconClass} text-xs`}></i>}
          <span>{techName}</span>
        </span>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < node.length) {
      parts.push(node.slice(lastIndex));
    }

    return parts;
  }

  if (Array.isArray(node)) {
    return React.Children.map(node, renderWithTechBadges);
  }

  return node;
}

// Extended sanitization schema supporting safe classes and target attributes
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...(defaultSchema.attributes?.a || []),
      "target",
      "rel",
      "className",
    ],
    code: [
      ...(defaultSchema.attributes?.code || []),
      "className",
    ],
    span: [
      ...(defaultSchema.attributes?.span || []),
      "className",
    ],
    div: [
      ...(defaultSchema.attributes?.div || []),
      "className",
    ],
  },
};

export default function MarkdownRenderer({ content = "", className = "" }) {
  // Pre-process upload placeholders
  const processedContent = useMemo(() => {
    if (!content) return "";
    return content.replace(
      /!\[__UPLOAD_[a-f0-9-]+__\]\(\)/g,
      "\n\n*Uploading media...*\n\n"
    );
  }, [content]);

  if (!processedContent.trim()) {
    return null;
  }

  return (
    <div className={`markdown-body text-zinc-300 leading-relaxed overflow-hidden ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-extrabold text-zinc-50 tracking-tight mt-6 mb-3 border-b border-zinc-800 pb-2">
              {renderWithTechBadges(children)}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight mt-5 mb-2.5 border-b border-zinc-800/60 pb-1.5">
              {renderWithTechBadges(children)}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-zinc-100 mt-4 mb-2">
              {renderWithTechBadges(children)}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-3 leading-relaxed text-zinc-300 text-sm sm:text-base">
              {renderWithTechBadges(children)}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-emerald-500/80 bg-zinc-900/40 pl-4 py-2 my-3 rounded-r-lg text-zinc-400 italic text-sm">
              {renderWithTechBadges(children)}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-5 my-3 space-y-1 text-sm sm:text-base text-zinc-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-5 my-3 space-y-1 text-sm sm:text-base text-zinc-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1 leading-relaxed">
              {renderWithTechBadges(children)}
            </li>
          ),
          hr: () => <hr className="border-zinc-800 my-6" />,
          strong: ({ children }) => (
            <strong className="font-bold text-zinc-100">
              {renderWithTechBadges(children)}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-200">
              {renderWithTechBadges(children)}
            </em>
          ),
          a: ({ href, children }) => {
            const isExternal = href?.startsWith("http://") || href?.startsWith("https://");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="text-emerald-400 hover:text-emerald-300 underline font-medium break-words transition-colors"
              >
                {renderWithTechBadges(children)}
              </a>
            );
          },
          img: ({ src, alt }) => {
            if (!src) return null;
            return (
              <span className="block my-4 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/60 shadow-lg">
                <img
                  src={src}
                  alt={alt || "Project visual"}
                  className="max-w-full h-auto mx-auto object-contain max-h-[500px]"
                  loading="lazy"
                />
              </span>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-zinc-800 bg-zinc-950/40">
              <table className="w-full text-left border-collapse text-xs sm:text-sm text-zinc-300">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-zinc-800 bg-zinc-900/70 px-3.5 py-2.5 font-semibold text-zinc-200">
              {renderWithTechBadges(children)}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-zinc-800/60 px-3.5 py-2.5 text-zinc-300">
              {renderWithTechBadges(children)}
            </td>
          ),
          code: ({ inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match ? match[1] : "";

            if (inline) {
              return (
                <code
                  className="bg-zinc-900 text-emerald-400 border border-zinc-800/80 px-1.5 py-0.5 rounded font-mono text-xs"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="rounded-xl overflow-hidden my-4 border border-zinc-800 bg-[#0c0c0f] font-mono text-xs">
                {lang && (
                  <div className="bg-zinc-900/90 px-4 py-2 border-b border-zinc-800 flex justify-between items-center text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
                    <span>{lang}</span>
                  </div>
                )}
                <pre className="p-4 overflow-x-auto text-emerald-400/95 leading-relaxed">
                  <code>{children}</code>
                </pre>
              </div>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
