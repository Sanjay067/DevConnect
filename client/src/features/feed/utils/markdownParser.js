import { getTechIconClass } from "@/shared/lib/techIcons";

const isSafeUrl = (url = "") => {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const UPLOAD_PLACEHOLDER_REGEX = /!\[__UPLOAD_[a-f0-9-]+__\]\(\)/g;

export const renderMarkdown = (text = "") => {
  if (!text) return "";

  let html = text.replace(/<!--[\s\S]*?-->/g, "");

  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(UPLOAD_PLACEHOLDER_REGEX, () =>
    '<div class="my-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-400"><i class="fa-solid fa-circle-notch fa-spin mr-1"></i> Uploading image...</div>'
  );

  const codeBlocks = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const id = `__MD_CODE_BLOCK_PLACEHOLDER_${codeBlocks.length}__`;
    codeBlocks.push({ lang, code });
    return id;
  });

  html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-gray-900 mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-gray-900 mt-5 mb-3">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-gray-900 mt-6 mb-4">$1</h1>');

  html = html.replace(/^---$/gim, '<hr class="border-gray-200 my-4" />');

  html = html.replace(
    /^&gt;\s+(.*$)/gim,
    '<blockquote class="border-l-4 border-blue-500 pl-4 py-1 my-3 text-gray-600 bg-gray-50/50 rounded-r-md italic">$1</blockquote>'
  );

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(
    /`(.*?)`/g,
    '<code class="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded font-mono text-xs border border-gray-200/50">$1</code>'
  );

  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
    if (!isSafeUrl(url)) {
      return `<span class="text-red-500 text-xs">[unsafe image: ${alt}]</span>`;
    }
    return `<div class="my-4 max-w-full rounded-xl overflow-hidden border border-gray-100 shadow-sm"><img src="${url}" alt="${alt}" class="max-w-full h-auto mx-auto object-contain" /></div>`;
  });

  html = html.replace(/\[(.*?)\]\((.*?)\)/g, (match, label, url) => {
    if (!isSafeUrl(url)) {
      return `<span class="text-red-500 text-xs">[unsafe link: ${label}]</span>`;
    }
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">${label}</a>`;
  });

  html = html.replace(/@\[(.*?)\]/g, (match, techName) => {
    const iconClass = getTechIconClass(techName);
    return `<span class="inline-flex items-center gap-1 bg-gray-50 border border-gray-200/80 px-2 py-0.5 rounded text-gray-700 text-xs font-semibold select-all capitalize mx-0.5">${iconClass ? `<i class="${iconClass} text-xs"></i>` : ""}${techName}</span>`;
  });

  const lines = html.split("\n");
  const processedLines = [];
  let inList = false;

  for (const line of lines) {
    const isListItem = /^\s*-\s+/.test(line) && !line.startsWith("<");

    if (isListItem) {
      const content = line.replace(/^\s*-\s+/, "");
      if (!inList) {
        processedLines.push('<ul class="list-disc ml-5 my-2 space-y-1">');
        inList = true;
      }
      processedLines.push(`<li class="text-gray-700 pl-1">${content}</li>`);
    } else {
      if (inList) {
        processedLines.push("</ul>");
        inList = false;
      }

      if (
        line.includes("__MD_CODE_BLOCK_PLACEHOLDER_") ||
        line.startsWith("<h") ||
        line.startsWith("<hr") ||
        line.startsWith("<block") ||
        line.startsWith("<div") ||
        line.startsWith("<ul") ||
        line.startsWith("</ul")
      ) {
        processedLines.push(line);
      } else {
        processedLines.push(line ? `<p class="my-2 leading-relaxed text-gray-700">${line}</p>` : "");
      }
    }
  }

  if (inList) processedLines.push("</ul>");
  html = processedLines.join("");

  codeBlocks.forEach((block, idx) => {
    const placeholder = `__MD_CODE_BLOCK_PLACEHOLDER_${idx}__`;
    // `block.code` has already been HTML-escaped above. Do not decode it:
    // this string is eventually assigned to dangerouslySetInnerHTML.
    const cleanCode = block.code;

    const codeHtml = `<div class="bg-gray-900 rounded-xl overflow-hidden my-4 border border-gray-800 font-mono text-xs text-gray-200">
      <div class="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center text-gray-400 text-[10px] uppercase font-bold tracking-wider">
        <span>${block.lang || "code"}</span>
      </div>
      <pre class="p-4 overflow-x-auto leading-relaxed"><code>${cleanCode}</code></pre>
    </div>`;
    html = html.replace(placeholder, codeHtml);
  });

  return html;
};
