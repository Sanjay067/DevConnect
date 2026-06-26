const getTechIconClass = (tech = "") => {
  const key = tech.trim().toLowerCase().replace(/\s+/g, "");
  switch (key) {
    case "react":
    case "reactjs":
      return "fa-brands fa-react text-blue-400";
    case "node":
    case "nodejs":
      return "fa-brands fa-node-js text-green-500";
    case "js":
    case "javascript":
      return "fa-brands fa-js text-yellow-500";
    case "python":
      return "fa-brands fa-python text-blue-550";
    case "html":
    case "html5":
      return "fa-brands fa-html5 text-orange-500";
    case "css":
    case "css3":
      return "fa-brands fa-css3-alt text-blue-600";
    case "docker":
      return "fa-brands fa-docker text-blue-400";
    case "git":
    case "github":
      return "fa-brands fa-github text-gray-800";
    case "aws":
      return "fa-brands fa-aws text-orange-400";
    case "vue":
    case "vuejs":
      return "fa-brands fa-vuejs text-green-500";
    case "angular":
    case "angularjs":
      return "fa-brands fa-angular text-red-650";
    case "sass":
      return "fa-brands fa-sass text-pink-400";
    case "mongodb":
      return "fa-solid fa-database text-green-600";
    case "mysql":
      return "fa-solid fa-database text-blue-500";
    case "postgresql":
      return "fa-solid fa-database text-blue-400";
    case "express":
      return "fa-solid fa-server text-gray-500";
    case "redux":
      return "fa-solid fa-atom text-purple-500";
    case "tailwindcss":
      return "fa-solid fa-wind text-blue-400";
    default:
      return null;
  }
};

export const renderMarkdown = (text = "") => {
  if (!text) return "";

  // 1. Remove comments like <!-- comment -->
  let html = text.replace(/<!--[\s\S]*?-->/g, "");

  // 2. Escape HTML tag brackets to prevent raw HTML injections
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 3. Extract and preserve code blocks (```lang ... ```)
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const id = `__MD_CODE_BLOCK_PLACEHOLDER_${codeBlocks.length}__`;
    codeBlocks.push({ lang, code });
    return id;
  });

  // 4. Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-gray-900 mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-gray-900 mt-5 mb-3">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-gray-900 mt-6 mb-4 pb-1 border-b border-gray-150">$1</h1>');

  // 5. Horizontal Rules (---)
  html = html.replace(/^---$/gim, '<hr class="border-gray-200 my-4" />');

  // 6. Blockquotes
  html = html.replace(/^&gt;\s+(.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 py-1 my-3 text-gray-600 bg-gray-50/50 rounded-r-md italic">$1</blockquote>');

  // 7. Bold and Italics
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // 8. Inline Code (`code`)
  html = html.replace(/`(.*?)`/g, '<code class="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded font-mono text-xs border border-gray-200/50">$1</code>');

  // 9. Links [label](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline font-semibold">$1</a>');

  // 10. Images ![alt](url)
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<div class="my-4 max-w-full rounded-xl overflow-hidden border border-gray-100 shadow-sm"><img src="$2" alt="$1" class="max-w-full h-auto mx-auto object-contain" /></div>');

  // 10.5 Tech Stack Badges @[TechName]
  html = html.replace(/@\[(.*?)\]/g, (match, techName) => {
    const iconClass = getTechIconClass(techName);
    return `<span class="inline-flex items-center gap-1 bg-gray-50 border border-gray-200/80 px-2 py-0.5 rounded text-gray-700 text-xs font-semibold select-all capitalize mx-0.5">${iconClass ? `<i class="${iconClass} text-xs"></i>` : ""}${techName}</span>`;
  });

  // 11. Lists
  // Parse unordered lists (- item)
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="list-disc ml-5 pl-1 my-1 text-gray-700">$1</li>');

  // 12. Handle newlines outside code blocks and list items
  // We wrap multi-line elements later if needed, but a simple newline to <br /> is responsive.
  // We replace lone newlines that are not inside code block placeholders.
  html = html.split("\n").map(line => {
    // If it's a code block placeholder, bullet tag, or heading tag, keep it block.
    if (line.includes("__MD_CODE_BLOCK_PLACEHOLDER_") || 
        line.startsWith("<h") || 
        line.startsWith("<hr") || 
        line.startsWith("<block") || 
        line.startsWith("<li")) {
      return line;
    }
    return line ? `<p class="my-2 leading-relaxed text-gray-700">${line}</p>` : "";
  }).join("");

  // Restore code blocks with high-contrast editor styling
  codeBlocks.forEach((block, idx) => {
    const placeholder = `__MD_CODE_BLOCK_PLACEHOLDER_${idx}__`;
    const cleanCode = block.code
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");

    const codeHtml = `<div class="bg-gray-900 rounded-xl overflow-hidden my-4 border border-gray-800 font-mono text-xs text-gray-200">
      <div class="bg-gray-850 px-4 py-2 border-b border-gray-800 flex justify-between items-center text-gray-400 text-[10px] uppercase font-bold tracking-wider">
        <span>${block.lang || "code"}</span>
      </div>
      <pre class="p-4 overflow-x-auto leading-relaxed"><code>${cleanCode}</code></pre>
    </div>`;
    html = html.replace(placeholder, codeHtml);
  });

  return html;
};
