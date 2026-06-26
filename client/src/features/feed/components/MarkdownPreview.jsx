import React from "react";
import { renderMarkdown } from "../utils/markdownParser";

function MarkdownPreview({ markdown }) {
    const renderedHtml = renderMarkdown(markdown);

    return (
        <div className="w-full h-full overflow-y-auto p-6 pb-32 bg-white prose max-w-none">
            {renderedHtml ? (
                <div
                    className="markdown-body text-sm text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
            ) : (
                <div className="flex h-full items-center justify-center text-gray-400 italic text-xs select-none">
                    Rendered preview will appear here...
                </div>
            )}
        </div>
    );
}

export default MarkdownPreview;
