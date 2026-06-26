import React, { useRef, useState } from "react";
import { uploadAsset } from "@/services/postService";

function EditorToolbar({ textareaRef, value, onChange }) {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

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

        // Refocus textarea and place cursor nicely
        setTimeout(() => {
            textarea.focus();
            const newCursor = start + syntaxBefore.length + (selection ? selection.length : 0);
            textarea.setSelectionRange(newCursor, newCursor + syntaxAfter.length);
        }, 0);
    };

    const handleFormat = (type) => {
        switch (type) {
            case "h":
                insertMarkdown("\n# ");
                break;
            case "h2":
                insertMarkdown("\n## ");
                break;
            case "b":
                insertMarkdown("**", "**");
                break;
            case "i":
                insertMarkdown("*", "*");
                break;
            case "list":
                insertMarkdown("\n- ");
                break;
            case "code":
                insertMarkdown("`", "`");
                break;
            case "codeblock":
                insertMarkdown("\n```javascript\n", "\n```\n");
                break;
            case "quote":
                insertMarkdown("\n> ");
                break;
            case "divider":
                insertMarkdown("\n---\n");
                break;
            case "link":
                insertMarkdown("[", "](url)");
                break;
            default:
                break;
        }
    };

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await uploadAsset(formData);
            const imageUrl = res.data.url;
            insertMarkdown(`\n![${file.name}](${imageUrl})\n`);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to upload image.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex items-center gap-1.5 p-2 bg-gray-50 border-b border-gray-200 shrink-0 text-gray-500 overflow-x-auto">
            {/* Heading Buttons */}
            <button
                type="button"
                onClick={() => handleFormat("h")}
                title="Heading 1"
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 font-bold text-xs"
            >
                H1
            </button>
            <button
                type="button"
                onClick={() => handleFormat("h2")}
                title="Heading 2"
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 font-bold text-[10px]"
            >
                H2
            </button>

            <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>

            {/* Typography */}
            <button
                type="button"
                onClick={() => handleFormat("b")}
                title="Bold"
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 font-bold text-xs"
            >
                B
            </button>
            <button
                type="button"
                onClick={() => handleFormat("i")}
                title="Italic"
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 italic font-semibold text-xs"
            >
                I
            </button>

            <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>

            {/* Lists & Quotes */}
            <button
                type="button"
                onClick={() => handleFormat("list")}
                title="Bullet List"
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200"
            >
                <i className="fa-solid fa-list text-xs"></i>
            </button>
            <button
                type="button"
                onClick={() => handleFormat("quote")}
                title="Blockquote"
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200"
            >
                <i className="fa-solid fa-quote-left text-xs"></i>
            </button>

            <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>

            {/* Links & Elements */}
            <button
                type="button"
                onClick={() => handleFormat("link")}
                title="Link"
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200"
            >
                <i className="fa-solid fa-link text-xs"></i>
            </button>
            <button
                type="button"
                onClick={() => handleFormat("divider")}
                title="Horizontal Divider"
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200"
            >
                <i className="fa-solid fa-minus text-xs"></i>
            </button>

            {/* Image Upload */}
            <button
                type="button"
                disabled={isUploading}
                onClick={handleImageUploadClick}
                title="Upload image"
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-50 ml-auto"
            >
                {isUploading ? (
                    <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                ) : (
                    <i className="fa-regular fa-image text-xs"></i>
                )}
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}

export default EditorToolbar;
