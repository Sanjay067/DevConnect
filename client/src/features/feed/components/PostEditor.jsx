"use client";

import React, { useState, useRef, useEffect } from "react";
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
- **Frontend**: @[React] @[Next.js]  @[Redux] @[TailwindCSS]
- **Backend**: @[Node.js] @[Express]  @[MongoDB]
- **APIs & Tools**: @[Cloudinary] @[Multer]

# Challenges & Learnings
<!-- Share your development journey. What challenges did you face, and how did you overcome them? -->
![alt text](https://imgs.search.brave.com/Thjx23AhKgZNff_w5KvRn_8d9-HtARJuydkgSK1ByRY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c21hcnRzaGVldC5j/b20vc2l0ZXMvZGVm/YXVsdC9maWxlcy8y/MDI0LTEwL0lDLU1p/bmQtTWFwLVByb2pl/Y3QtUGxhbi1FeGFt/cGxlLnBuZw)
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

  // ── Mobile layout & active tab state ──────────────────────────
  const [activeTab, setActiveTab] = useState("edit"); // "edit" | "preview"
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Resizer logic ───────────────────────────────────────────
  const [editorWidth, setEditorWidth] = useState(70);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) setEditorWidth(newWidth);
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };
  }, [isDragging]);

  const clearError = () => { if (errorMsg) setErrorMsg(""); };

  // ── Mention popup logic (unchanged) ─────────────────────────
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
      if (e.key === "Escape") { e.preventDefault(); setShowMentionPopup(false); }
      else if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex((p) => (p + 1) % filteredSuggestions.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setMentionIndex((p) => p === 0 ? filteredSuggestions.length - 1 : p - 1); }
      else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); handleSelectMention(filteredSuggestions[mentionIndex]); }
    }
  };

  // ── Image upload logic (unchanged) ──────────────────────────
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
    setMarkdownText((prev) => prev.substring(0, start) + placeholder + prev.substring(end));
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
      replacePlaceholder(placeholder, `\n![${file.name}](${res.data.url})\n`);
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
    uploadQueueRef.current = uploadQueueRef.current.then(() => handleImageUpload(file)).catch(() => { });
  };

  const handleImageUploadClick = () => fileInputRef.current?.click();

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

  // ── Validation & submit (unchanged) ─────────────────────────
  const formatUrl = (url) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed && !/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
    return trimmed;
  };

  const isValidUrl = (url) => {
    if (!url) return true;
    try { new URL(url); return true; } catch { return false; }
  };

  const buildFormData = () => {
    const formattedGithub = formatUrl(githubUrl);
    const formattedLive = formatUrl(liveUrl);
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("shortDescription", shortDescription.trim());
    formData.append("lookingForContributors", lookingForContributors);
    formData.append("content", JSON.stringify({
      blocks: [{ type: "paragraph", data: { text: markdownText.trim() } }],
    }));
    const linksArray = [];
    if (formattedGithub) linksArray.push({ url: formattedGithub, label: "Github" });
    if (formattedLive) linksArray.push({ url: formattedLive, label: "Live Demo" });
    formData.append("links", JSON.stringify(linksArray));
    const extractedTechStack = [];
    const mentionRegex = /@\[([^\]]+)\]/g;
    let match;
    while ((match = mentionRegex.exec(markdownText)) !== null) {
      const techName = match[1].trim();
      if (techName && !extractedTechStack.includes(techName)) extractedTechStack.push(techName);
    }
    formData.append("techStack", JSON.stringify(extractedTechStack));
    return { formData, formattedGithub, formattedLive };
  };

  const handlePublish = () => {
    if (!title.trim()) { setErrorMsg("Post title is required."); return; }
    if (!markdownText.trim()) { setErrorMsg("Project details write-up is required."); return; }
    const { formData, formattedGithub, formattedLive } = buildFormData();
    if (githubUrl.trim() && !isValidUrl(formattedGithub)) { setErrorMsg("Please enter a valid GitHub URL."); return; }
    if (liveUrl.trim() && !isValidUrl(formattedLive)) { setErrorMsg("Please enter a valid Live Demo URL."); return; }
    onSubmit(formData, {
      onError: (err) => setErrorMsg(err.response?.data?.message || "Failed to publish project post."),
    });
  };

  const submitLabel = mode === "edit" ? "Save Changes" : "Publish";
  const pendingLabel = mode === "edit" ? "Saving..." : "Publishing...";

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen text-sm" style={{ background: "var(--bg)" }}>

      {/* ── Slim topbar ───────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 shrink-0"
        style={{ background: "var(--surface)" }}
      >
        {/* Left: logo + mode label */}
        <div className="flex items-center gap-2">
          <i className="fa-regular fa-compass text-sm text-emerald-500"></i>
          <span className="text-xs font-bold text-zinc-400 tracking-tight">
            {mode === "edit" ? "Editing project" : "New project"}
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3">
          {errorMsg && (
            <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-3 py-1.5 text-xs font-semibold">
              <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
              {errorMsg}
            </div>
          )}
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isPending}
            className="px-3.5 py-1.5 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-all text-xs font-semibold disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPending || isUploading}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-all text-xs disabled:opacity-50 cursor-pointer"
            style={{ boxShadow: "0 0 12px rgba(16,185,129,0.25)" }}
          >
            {isPending ? (
              <><i className="fa-solid fa-circle-notch fa-spin text-[10px]"></i>{pendingLabel}</>
            ) : (
              <><i className="fa-solid fa-paper-plane text-[10px]"></i>{submitLabel}</>
            )}
          </button>
        </div>
      </div>

      {/* ── Document title zone ───────────────────────────────── */}
      <div
        className="px-8 py-6 border-b border-zinc-800 shrink-0"
        style={{ background: "var(--surface)" }}
      >
        {/* Giant project title */}
        <input
          type="text"
          placeholder="Project title..."
          value={title}
          onChange={(e) => { clearError(); setTitle(e.target.value); }}
          className="w-full bg-transparent outline-none text-zinc-50 placeholder-zinc-700 font-extrabold tracking-tight leading-tight"
          style={{ fontSize: "2.25rem", lineHeight: 1.15 }}
        />
        {/* Short description */}
        <input
          type="text"
          placeholder="Short description (optional)"
          value={shortDescription}
          onChange={(e) => { clearError(); setShortDescription(e.target.value); }}
          className="w-full bg-transparent outline-none text-zinc-500 placeholder-zinc-700 mt-2 text-sm font-normal"
        />
      </div>

      {/* ── Edit / Preview Tabs switcher for Mobile layouts ── */}
      <div className="flex md:hidden border-b border-zinc-850 bg-zinc-950 px-6 py-2.5 shrink-0 justify-start">
        <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-850">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${activeTab === "edit"
                ? "bg-zinc-800 text-zinc-50 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
              }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${activeTab === "preview"
                ? "bg-zinc-800 text-zinc-50 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
              }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* ── Split editor / preview ────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Editor panel */}
        <div
          className={`flex flex-col h-full border-r border-zinc-800 shrink-0 ${activeTab === 'edit' ? 'flex w-full' : 'hidden md:flex'}`}
          style={{ background: "#111113", width: isMobile ? "100%" : `${editorWidth}%` }}
        >

          <EditorToolbar
            textareaRef={editorRef}
            onChange={setMarkdownText}
            onImageUploadClick={handleImageUploadClick}
            isUploading={isUploading}
          />

          <div className="relative flex-1 flex flex-col min-h-0">
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
              placeholder="Write your project documentation in Markdown...&#10;&#10;Tip: Use @[React] to add tech badges automatically."
              className="flex-1 p-6 font-mono text-xs text-zinc-200 bg-transparent outline-none resize-none leading-relaxed overflow-y-auto placeholder-zinc-700"
            />

            {/* Bottom status bar */}
            <div
              className="flex justify-between items-center px-5 py-2.5 border-t border-zinc-800 text-[10px] shrink-0"
              style={{ background: "var(--bg)" }}
            >
              <div className="flex items-center gap-1.5 text-zinc-600">
                <i className="fa-brands fa-markdown text-xs"></i>
                <span>Markdown • type @[tech] for badges</span>
              </div>
              <button
                type="button"
                disabled={isUploading}
                onClick={handleImageUploadClick}
                className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer disabled:opacity-40"
              >
                {isUploading ? (
                  <><i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                    <span>Uploading{activeUploads > 1 ? ` (${activeUploads})` : ""}...</span></>
                ) : (
                  <><i className="fa-regular fa-image text-xs"></i>
                    <span>Paste or drop image</span></>
                )}
              </button>
            </div>

            {/* @mention popup — unchanged behavior */}
            {showMentionPopup && filteredSuggestions.length > 0 && (
              <div className="absolute bottom-12 left-4 z-40 w-52 rounded-xl border border-zinc-800 shadow-2xl flex flex-col max-h-52 overflow-y-auto divide-y divide-zinc-800 select-none"
                style={{ background: "var(--surface)" }}>
                <div className="px-3 py-1.5 text-[10px] text-zinc-600 font-semibold tracking-wider uppercase shrink-0">
                  Tech Stack Badges
                </div>
                {filteredSuggestions.map((tech, idx) => (
                  <button
                    key={tech.name}
                    type="button"
                    onClick={() => handleSelectMention(tech)}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-2 transition-colors text-xs font-semibold cursor-pointer ${idx === mentionIndex ? "bg-emerald-500/10 text-emerald-300" : "text-zinc-300 hover:bg-zinc-800"}`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center text-sm shrink-0">
                      <i className={tech.icon}></i>
                    </div>
                    <span>{tech.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resizer Handle (Hidden on Mobile) */}
        <div
          className={`hidden md:block w-1.5 cursor-col-resize shrink-0 transition-colors z-10 ${isDragging ? "bg-emerald-500/50" : "hover:bg-zinc-700 bg-zinc-900"}`}
          onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); }}
        />

        {/* Preview panel */}
        <div className={`flex-1 h-full overflow-hidden ${activeTab === 'preview' ? 'block' : 'hidden md:block'}`}>
          <MarkdownPreview
            markdown={markdownText}
            title={title}
            shortDescription={shortDescription}
            githubUrl={githubUrl}
            liveUrl={liveUrl}
          />
        </div>
      </div>

      {/* ── Metadata bar — below editor ───────────────────────── */}
      <div
        className="flex items-center gap-4 flex-wrap px-6 py-3 border-t border-zinc-800 shrink-0"
        style={{ background: "#0c0c0f" }}
      >
        <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest shrink-0">
          Project Links
        </span>

        {/* GitHub */}
        <div className="flex items-center gap-2 border border-zinc-800 rounded-xl px-3 py-1.5 focus-within:border-emerald-500/40 transition-all"
          style={{ background: "var(--surface)" }}>
          <i className="fa-brands fa-github text-zinc-500 text-sm shrink-0"></i>
          <input
            type="url"
            placeholder="GitHub URL"
            value={githubUrl}
            onChange={(e) => { clearError(); setGithubUrl(e.target.value); }}
            className="bg-transparent outline-none text-xs text-zinc-300 placeholder-zinc-600 w-36"
          />
        </div>

        {/* Live Demo */}
        <div className="flex items-center gap-2 border border-zinc-800 rounded-xl px-3 py-1.5 focus-within:border-emerald-500/40 transition-all"
          style={{ background: "var(--surface)" }}>
          <i className="fa-solid fa-globe text-zinc-500 text-sm shrink-0"></i>
          <input
            type="url"
            placeholder="Live Demo URL"
            value={liveUrl}
            onChange={(e) => { clearError(); setLiveUrl(e.target.value); }}
            className="bg-transparent outline-none text-xs text-zinc-300 placeholder-zinc-600 w-36"
          />
        </div>

        {/* Collaboration toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none ml-auto">
          <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
            Open to collaborators
          </span>
          <div
            onClick={() => setLookingForContributors((p) => !p)}
            className={`relative w-9 h-5 rounded-full border transition-all cursor-pointer ${lookingForContributors ? "bg-emerald-600/30 border-emerald-500/50" : "bg-zinc-900 border-zinc-700"}`}
          >
            <div className={`absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200 ${lookingForContributors ? "left-4 bg-emerald-500" : "left-0.5 bg-zinc-600"}`} />
          </div>
        </label>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  );
}

export default PostEditor;
