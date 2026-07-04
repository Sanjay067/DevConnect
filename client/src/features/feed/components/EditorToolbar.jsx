import React from "react";

function EditorToolbar({ textareaRef, onChange, onImageUploadClick, isUploading }) {
    const insertMarkdown = (syntaxBefore, syntaxAfter = "") => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;

        const selection = text.substring(start, end);
        const replacement = syntaxBefore + (selection || "") + syntaxAfter;
        const newValue = text.substring(0, start) + replacement + text.substring(end);

        onChange(newValue);

        setTimeout(() => {
            textarea.focus();
            const newCursor = start + syntaxBefore.length + (selection ? selection.length : 0);
            textarea.setSelectionRange(newCursor, newCursor + syntaxAfter.length);
        }, 0);
    };

    const handleFormat = (type) => {
        switch (type) {
            case "h": insertMarkdown("\n# "); break;
            case "h2": insertMarkdown("\n## "); break;
            case "b": insertMarkdown("**", "**"); break;
            case "i": insertMarkdown("*", "*"); break;
            case "list": insertMarkdown("\n- "); break;
            case "olist": insertMarkdown("\n1. "); break;
            case "quote": insertMarkdown("\n> "); break;
            case "code": insertMarkdown("`", "`"); break;
            case "codeblock": insertMarkdown("\n```javascript\n", "\n```\n"); break;
            case "link": insertMarkdown("[text](url)"); break;
            case "image-link": insertMarkdown("![alt text](", ")"); break;
            case "divider": insertMarkdown("\n---\n"); break;
            default: break;
        }
    };

    const Btn = ({ onClick, title, children, className = "" }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-xs font-bold cursor-pointer ${className}`}
        >
            {children}
        </button>
    );

    const Sep = () => (
        <div className="w-px h-4 bg-zinc-800 mx-0.5 shrink-0" />
    );

    return (
        <div className="flex items-center gap-0.5 px-3 py-2 border-b border-zinc-800 shrink-0 overflow-x-auto"
            style={{ background: "var(--bg)" }}>

            {/* Group 1: Headings */}
            <Btn onClick={() => handleFormat("h")} title="Heading 1">
                <span className="text-[11px]">H1</span>
            </Btn>
            <Btn onClick={() => handleFormat("h2")} title="Heading 2">
                <span className="text-[10px]">H2</span>
            </Btn>

            <Sep />

            {/* Group 2: Inline formatting */}
            <Btn onClick={() => handleFormat("b")} title="Bold">
                <span className="font-extrabold">B</span>
            </Btn>
            <Btn onClick={() => handleFormat("i")} title="Italic">
                <span className="italic font-semibold">I</span>
            </Btn>

            <Sep />

            {/* Group 3: Structure */}
            <Btn onClick={() => handleFormat("list")} title="Bullet List">
                <i className="fa-solid fa-list-ul text-[11px]"></i>
            </Btn>
            <Btn onClick={() => handleFormat("olist")} title="Ordered List">
                <i className="fa-solid fa-list-ol text-[11px]"></i>
            </Btn>
            <Btn onClick={() => handleFormat("quote")} title="Blockquote">
                <i className="fa-solid fa-quote-left text-[11px]"></i>
            </Btn>
            <Btn onClick={() => handleFormat("divider")} title="Divider">
                <i className="fa-solid fa-minus text-[11px]"></i>
            </Btn>

            <Sep />

            {/* Group 4: Code */}
            <Btn onClick={() => handleFormat("code")} title="Inline Code">
                <span className="font-mono text-[10px]">{"</>"}</span>
            </Btn>
            <Btn onClick={() => handleFormat("codeblock")} title="Code Block">
                <i className="fa-solid fa-code text-[11px]"></i>
            </Btn>

            <Sep />

            {/* Group 5: Media & Links */}
            <Btn onClick={() => handleFormat("link")} title="Link">
                <i className="fa-solid fa-link text-[11px]"></i>
            </Btn>
            <Btn onClick={() => handleFormat("image-link")} title="Image URL">
                <i className="fa-regular fa-image text-[11px]"></i>
            </Btn>

            {/* Upload — pushed right */}
            <Btn
                onClick={onImageUploadClick}
                title={isUploading ? "Uploading..." : "Upload image"}
                className={`ml-auto ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                {isUploading
                    ? <i className="fa-solid fa-circle-notch fa-spin text-[11px]"></i>
                    : <i className="fa-solid fa-arrow-up-from-bracket text-[11px]"></i>
                }
            </Btn>
        </div>
    );
}

export default EditorToolbar;
