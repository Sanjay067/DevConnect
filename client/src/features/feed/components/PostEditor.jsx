"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { uploadAsset } from "@/services/postService";
import EditorToolbar from "@/features/feed/components/EditorToolbar";
import MarkdownPreview from "@/features/feed/components/MarkdownPreview";
import { compressImage } from "@/shared/lib/compressImage";
import { TECH_SUGGESTIONS } from "@/shared/lib/techIcons";

export const DEFAULT_MARKDOWN_TEMPLATE = `# Project Overview
Enter your project overview here...

# Core Features
- **Feature A**: Description of what this feature does.
- **Feature B**: Another highlight of your application.

# Tech Stack & Libraries
<!-- Detail the key tools and libraries you used in your stack. -->
- **Frontend**: @[React], @[Next.js], @[Redux], @[TailwindCSS]
- **Backend**: @[Node.js], @[Express], @[MongoDB]
- **APIs & Tools**: @[Cloudinary], @[Multer]

# Challenges & Learnings
<!-- Share your development journey. What challenges did you face, and how did you overcome them? -->
`;

function PostEditor({
  mode = "create",
  initialTitle = "",
  initialShortDescription = "",
  initialMarkdown = DEFAULT_MARKDOWN_TEMPLATE,
  initialGithubUrl = "",
  initialLiveUrl = "",
  initialLookingForContributors = false,
  isPending = false,
  onSubmit,
}) {
  const router = useRouter();
  const currentUser = useSelector((state) => state.auth.user);

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadQueueRef = useRef(Promise.resolve());

  const [title, setTitle] = useState(initialTitle);
  const [shortDescription, setShortDescription] = useState(initialShortDescription);
  const [markdownText, setMarkdownText] = useState(initialMarkdown);
  const [githubUrl, setGithubUrl] = useState(initialGithubUrl);
  const [liveUrl, setLiveUrl] = useState(initialLiveUrl);
  const [lookingForContributors, setLookingForContributors] = useState(initialLookingForContributors);
  const [errorMsg, setErrorMsg] = useState("");
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activeUploads, setActiveUploads] = useState(0);

  const clearError = () => {
    if (errorMsg) setErrorMsg("");
  };

  const handleTextScan = (text, cursorIndex) => {
    const textBeforeCursor = text.substring(0, cursorIndex);
    const match = textBeforeCursor.match(/@([\w.-]*)$/);

    if (match) {
      const query = match[1].toLowerCase();
      setMentionQuery(match[1]);
      const filtered = TECH_SUGGESTIONS.filter((tech) =>
        tech.name.toLowerCase().includes(query)
      );
      setFilteredSuggestions(filtered);
      setMentionIndex(0);
      setShowMentionPopup(filtered.length > 0);
    } else {
      setShowMentionPopup(false);
      setMentionQuery("");
      setFilteredSuggestions([]);
      setMentionIndex(0);
    }
  };

  const handleEditorChange = (e) => {
    clearError();
    const text = e.target.value;
    setMarkdownText(text);
    handleTextScan(text, e.target.selectionEnd);
  };

  const handleSelectionChange = (e) => {
    handleTextScan(e.target.value, e.target.selectionEnd);
  };

  const handleSelectMention = (tech) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const cursorIndex = textarea.selectionEnd;
    const text = markdownText;
    const textBeforeCursor = text.substring(0, cursorIndex);
    const textAfterCursor = text.substring(cursorIndex);

    const atIndex = textBeforeCursor.lastIndexOf("@" + mentionQuery);
    if (atIndex === -1) return;

    const replacement = `@[${tech.name}] `;
    const newValue = text.substring(0, atIndex) + replacement + textAfterCursor;

    setMarkdownText(newValue);
    setShowMentionPopup(false);
    setFilteredSuggestions([]);

    setTimeout(() => {
      textarea.focus({ preventScroll: true });
      const newCursor = atIndex + replacement.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (showMentionPopup && filteredSuggestions.length > 0) {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowMentionPopup(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((prev) => (prev + 1) % filteredSuggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((prev) =>
          prev === 0 ? filteredSuggestions.length - 1 : prev - 1
        );
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        handleSelectMention(filteredSuggestions[mentionIndex]);
      }
    }
  };

  const replacePlaceholder = (placeholder, replacement) => {
    setMarkdownText((prev) => {
      if (!prev.includes(placeholder)) return prev;
      return prev.replace(placeholder, replacement);
    });
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    const textarea = editorRef.current;
    if (!textarea) return;

    const uploadId = crypto.randomUUID();
    const placeholder = `\n![__UPLOAD_${uploadId}__]()\n`;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    setMarkdownText((prev) => {
      const text = prev;
      return text.substring(0, start) + placeholder + text.substring(end);
    });

    const placeholderEnd = start + placeholder.length;
    setTimeout(() => {
      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(placeholderEnd, placeholderEnd);
    }, 0);

    setActiveUploads((n) => n + 1);
    setIsUploading(true);

    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressed);

      const res = await uploadAsset(formData);
      const imageUrl = res.data.url;
      const finalReplacement = `\n![${file.name}](${imageUrl})\n`;
      replacePlaceholder(placeholder, finalReplacement);
    } catch (err) {
      replacePlaceholder(placeholder, "");
      setErrorMsg(err.response?.data?.message || "Failed to upload image.");
    } finally {
      setActiveUploads((n) => {
        const next = n - 1;
        if (next <= 0) setIsUploading(false);
        return Math.max(0, next);
      });
    }
  };

  const queueImageUpload = (file) => {
    uploadQueueRef.current = uploadQueueRef.current
      .then(() => handleImageUpload(file))
      .catch(() => { });
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    queueImageUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) queueImageUpload(file);
        break;
      }
    }
  };

  const handleDrop = async (e) => {
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith("image/")) {
        e.preventDefault();
        queueImageUpload(files[i]);
        break;
      }
    }
  };

  const handleDragOver = (e) => {
    const hasImage = Array.from(e.dataTransfer.types).includes("Files");
    if (hasImage) e.preventDefault();
  };

  const formatUrl = (url) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const isValidUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const buildFormData = () => {
    const formattedGithub = formatUrl(githubUrl);
    const formattedLive = formatUrl(liveUrl);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("shortDescription", shortDescription.trim());
    formData.append("lookingForContributors", lookingForContributors);

    const contentObj = {
      blocks: [
        {
          type: "paragraph",
          data: { text: markdownText.trim() },
        },
      ],
    };
    formData.append("content", JSON.stringify(contentObj));

    const linksArray = [];
    if (formattedGithub) linksArray.push({ url: formattedGithub, label: "Github" });
    if (formattedLive) linksArray.push({ url: formattedLive, label: "Live Demo" });
    formData.append("links", JSON.stringify(linksArray));

    const extractedTechStack = [];
    const mentionRegex = /@\[([^\]]+)\]/g;
    let match;
    while ((match = mentionRegex.exec(markdownText)) !== null) {
      const techName = match[1].trim();
      if (techName && !extractedTechStack.includes(techName)) {
        extractedTechStack.push(techName);
      }
    }
    formData.append("techStack", JSON.stringify(extractedTechStack));

    return { formData, formattedGithub, formattedLive };
  };

  const handlePublish = () => {
    if (!title.trim()) {
      setErrorMsg("Post title is required.");
      return;
    }
    if (!markdownText.trim()) {
      setErrorMsg("Project details write-up is required.");
      return;
    }

    const { formData, formattedGithub, formattedLive } = buildFormData();

    if (githubUrl.trim() && !isValidUrl(formattedGithub)) {
      setErrorMsg("Please enter a valid GitHub URL.");
      return;
    }
    if (liveUrl.trim() && !isValidUrl(formattedLive)) {
      setErrorMsg("Please enter a valid Live Demo URL.");
      return;
    }

    onSubmit(formData, {
      onError: (err) => {
        setErrorMsg(err.response?.data?.message || "Failed to publish project post.");
      },
    });
  };

  const pageTitle = mode === "edit" ? "Edit Project" : "Showcase Project";
  const submitLabel = mode === "edit" ? "Save Changes" : "Publish Post";
  const pendingLabel = mode === "edit" ? "Saving..." : "Publishing...";

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 text-sm text-gray-700 pb-6">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold text-gray-900">{pageTitle}</h1>
          <div className="flex items-center gap-3">
            {errorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-1.5 text-xs font-semibold leading-snug">
                {errorMsg}
              </div>
            )}
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isPending}
              className="px-4 py-1.5 border border-gray-200 rounded-full font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPending || isUploading}
              className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full flex items-center gap-2 transition-colors disabled:opacity-50 text-xs shadow-sm shadow-blue-500/10"
            >
              {isPending ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                  {pendingLabel}
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                  {submitLabel}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <input
            type="text"
            placeholder="Give your project a title..."
            value={title}
            onChange={(e) => { clearError(); setTitle(e.target.value); }}
            className="flex-1 border border-gray-250 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 font-semibold bg-gray-50/50"
          />

          <div className="flex items-center gap-4 flex-wrap md:justify-end shrink-0">
            <div className="flex items-center gap-1.5 border border-gray-250 rounded-xl px-3 py-1.5 bg-gray-50 focus-within:border-blue-500 transition-all">
              <i className="fa-brands fa-github text-gray-400"></i>
              <input
                type="url"
                placeholder="GitHub URL"
                value={githubUrl}
                onChange={(e) => { clearError(); setGithubUrl(e.target.value); }}
                className="bg-transparent outline-none w-28 text-[11px] text-gray-700"
              />
            </div>
            <div className="flex items-center gap-1.5 border border-gray-250 rounded-xl px-3 py-1.5 bg-gray-50 focus-within:border-blue-500 transition-all">
              <i className="fa-solid fa-globe text-gray-400"></i>
              <input
                type="url"
                placeholder="Live Demo URL"
                value={liveUrl}
                onChange={(e) => { clearError(); setLiveUrl(e.target.value); }}
                className="bg-transparent outline-none w-28 text-[11px] text-gray-700"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs text-gray-500 font-semibold">Collab open</span>
              <input
                type="checkbox"
                checked={lookingForContributors}
                onChange={(e) => setLookingForContributors(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="w-1/2 flex flex-col h-full pr-3">
          <div className="flex-1 flex flex-col border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all relative">
            <EditorToolbar
              textareaRef={editorRef}
              onChange={setMarkdownText}
              onImageUploadClick={handleImageUploadClick}
              isUploading={isUploading}
            />

            <textarea
              ref={editorRef}
              value={markdownText}
              onChange={handleEditorChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onSelect={handleSelectionChange}
              onKeyUp={handleSelectionChange}
              placeholder="Compose your project documentation using Markdown..."
              className="flex-1 p-6 pb-24 font-mono text-xs text-gray-800 bg-transparent outline-none resize-none leading-relaxed overflow-y-auto"
            />

            <div className="flex justify-between items-center px-5 py-3 border-t border-gray-150 bg-gray-50/50 text-[11px] text-gray-500 rounded-b-2xl select-none shrink-0">
              <div className="flex items-center gap-1.5 font-semibold text-gray-400">
                <i className="fa-brands fa-markdown text-sm"></i>
                <span>Markdown is supported</span>
              </div>
              <button
                type="button"
                disabled={isUploading}
                onClick={handleImageUploadClick}
                className="flex items-center gap-1.5 font-bold hover:text-blue-600 transition-colors cursor-pointer text-gray-500 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                    <span>Uploading{activeUploads > 1 ? ` (${activeUploads})` : ""}...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-regular fa-image text-sm text-gray-400"></i>
                    <span>Paste or drop to add images </span>
                  </>
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {showMentionPopup && filteredSuggestions.length > 0 && (
              <div className="absolute bottom-16 left-4 z-40 w-48 bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col max-h-48 overflow-y-auto divide-y divide-gray-100 scale-in select-none">
                <div className="px-3 py-1.5 bg-gray-50 text-[10px] text-gray-400 font-semibold tracking-wider uppercase shrink-0">
                  Tech Stack Badges
                </div>
                {filteredSuggestions.map((tech, idx) => (
                  <button
                    key={tech.name}
                    type="button"
                    onClick={() => handleSelectMention(tech)}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-2 transition-colors text-xs font-semibold ${idx === mentionIndex ? "bg-blue-50/80" : "hover:bg-blue-50/50"
                      }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center text-sm shrink-0">
                      <i className={tech.icon}></i>
                    </div>
                    <span className="text-gray-800">{tech.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-1/2 h-full pl-3">
          <div className="h-full border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <MarkdownPreview markdown={markdownText} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostEditor;
