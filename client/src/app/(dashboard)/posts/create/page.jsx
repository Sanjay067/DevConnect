"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useCreatePost } from "@/features/feed/hooks/useFeed";
import { uploadAsset } from "@/services/postService";
import EditorToolbar from "@/features/feed/components/EditorToolbar";
import MarkdownPreview from "@/features/feed/components/MarkdownPreview";

const TECH_SUGGESTIONS = [
    { name: "React", icon: "fa-brands fa-react text-blue-400" },
    { name: "Node.js", icon: "fa-brands fa-node-js text-green-500" },
    { name: "JavaScript", icon: "fa-brands fa-js text-yellow-500" },
    { name: "Python", icon: "fa-brands fa-python text-blue-500" },
    { name: "HTML5", icon: "fa-brands fa-html5 text-orange-500" },
    { name: "CSS3", icon: "fa-brands fa-css3-alt text-blue-600" },
    { name: "Docker", icon: "fa-brands fa-docker text-blue-400" },
    { name: "GitHub", icon: "fa-brands fa-github text-gray-800" },
    { name: "AWS", icon: "fa-brands fa-aws text-orange-400" },
    { name: "Vue.js", icon: "fa-brands fa-vuejs text-green-500" },
    { name: "Angular", icon: "fa-brands fa-angular text-red-600" },
    { name: "Sass", icon: "fa-brands fa-sass text-pink-400" },
    { name: "MongoDB", icon: "fa-solid fa-database text-green-600" },
    { name: "MySQL", icon: "fa-solid fa-database text-blue-500" },
    { name: "PostgreSQL", icon: "fa-solid fa-database text-blue-400" },
    { name: "Express", icon: "fa-solid fa-server text-gray-500" },
    { name: "Redux", icon: "fa-solid fa-atom text-purple-500" },
    { name: "TailwindCSS", icon: "fa-solid fa-wind text-blue-400" },
];

const DEFAULT_MARKDOWN_TEMPLATE = `# Project Overview
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

function CreatePostPage() {
    const router = useRouter();
    const currentUser = useSelector((state) => state.auth.user);
    const { mutate: createPostMutation, isPending } = useCreatePost();

    // Editor textarea Ref
    const editorRef = useRef(null);

    // Form inputs states
    const [title, setTitle] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [markdownText, setMarkdownText] = useState(DEFAULT_MARKDOWN_TEMPLATE);
    const [githubUrl, setGithubUrl] = useState("");
    const [liveUrl, setLiveUrl] = useState("");
    const [lookingForContributors, setLookingForContributors] = useState(false);

    // Error tracking
    const [errorMsg, setErrorMsg] = useState("");

    // Tech Suggest Popover states
    const [showMentionPopup, setShowMentionPopup] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);

    const handleTextScan = (text, cursorIndex) => {
        const textBeforeCursor = text.substring(0, cursorIndex);
        const match = textBeforeCursor.match(/@(\w*)$/);

        if (match) {
            const query = match[1].toLowerCase();
            setMentionQuery(match[1]);
            const filtered = TECH_SUGGESTIONS.filter((tech) =>
                tech.name.toLowerCase().includes(query)
            );
            setFilteredSuggestions(filtered);
            setShowMentionPopup(true);
        } else {
            setShowMentionPopup(false);
            setMentionQuery("");
            setFilteredSuggestions([]);
        }
    };

    const handleEditorChange = (e) => {
        const text = e.target.value;
        setMarkdownText(text);
        handleTextScan(text, e.target.selectionEnd);
    };

    const handleSelectionChange = (e) => {
        handleTextScan(e.target.value, e.target.selectionEnd);
    };

    const handleKeyDown = (e) => {
        if (showMentionPopup && filteredSuggestions.length > 0) {
            if (e.key === "Escape") {
                e.preventDefault();
                setShowMentionPopup(false);
            } else if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                handleSelectMention(filteredSuggestions[0]);
            }
        }
    };

    const handleSelectMention = (tech) => {
        const textarea = editorRef.current;
        if (!textarea) return;

        const cursorIndex = textarea.selectionEnd;
        const text = textarea.value;
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
            textarea.focus();
            const newCursor = atIndex + replacement.length;
            textarea.setSelectionRange(newCursor, newCursor);
        }, 0);
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
        } catch (_) {
            return false;
        }
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

        // Format and validate URLs
        const formattedGithub = formatUrl(githubUrl);
        const formattedLive = formatUrl(liveUrl);

        if (githubUrl.trim() && !isValidUrl(formattedGithub)) {
            setErrorMsg("Please enter a valid GitHub URL.");
            return;
        }
        if (liveUrl.trim() && !isValidUrl(formattedLive)) {
            setErrorMsg("Please enter a valid Live Demo URL.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("shortDescription", shortDescription.trim());
        formData.append("lookingForContributors", lookingForContributors);

        // Package markdown body inside the EditorJS-styled JSON blocks structure
        const contentObj = {
            blocks: [
                {
                    type: "paragraph",
                    data: {
                        text: markdownText.trim(),
                    },
                },
            ],
        };
        formData.append("content", JSON.stringify(contentObj));

        // Package links
        const linksArray = [];
        if (formattedGithub) {
            linksArray.push({ url: formattedGithub, label: "Github" });
        }
        if (formattedLive) {
            linksArray.push({ url: formattedLive, label: "Live Demo" });
        }
        formData.append("links", JSON.stringify(linksArray));

        // Auto-extract tech stack tags from the markdown text
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

        createPostMutation(formData, {
            onSuccess: () => {
                router.push("/feed");
            },
            onError: (err) => {
                setErrorMsg(err.response?.data?.message || "Failed to publish project post.");
            },
        });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 text-sm text-gray-700 pb-6">
            {/* Top Workspace Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col gap-4 shrink-0">
                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="font-extrabold text-lg text-gray-900 tracking-tight">Showcase Project</span>
                        <span className="text-gray-300 text-base font-light">|</span>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
                                {currentUser?.profilePicture && (
                                    <img src={currentUser.profilePicture} alt="" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <span className="text-xs text-gray-500 font-medium">@{currentUser?.username}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.push("/feed")}
                            disabled={isPending}
                            className="px-4 py-1.5 border border-gray-200 rounded-full font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handlePublish}
                            disabled={isPending}
                            className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full flex items-center gap-2 transition-colors disabled:opacity-50 text-xs shadow-sm shadow-blue-500/10"
                        >
                            {isPending ? (
                                <>
                                    <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-paper-plane text-xs"></i>
                                    Publish Post
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-2.5 text-xs font-semibold leading-snug">
                        {errorMsg}
                    </div>
                )}

                {/* Primary Metadata Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder="Enter your title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-base font-bold text-gray-900 border-b border-gray-100 focus:border-blue-500 py-1 bg-transparent outline-none transition-colors placeholder-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Add short description / tagline (max 200 chars)..."
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                            maxLength={200}
                            className="w-full text-xs text-gray-500 border-b border-gray-100 focus:border-blue-500 py-1 bg-transparent outline-none transition-colors placeholder-gray-400"
                        />
                    </div>

                    <div className="flex flex-col gap-3 justify-end">
                        {/* Links & Contributors Toggle */}
                        <div className="flex flex-wrap items-center gap-4 justify-between md:justify-end">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 border border-gray-250 rounded-xl px-3 py-1.5 bg-gray-50 focus-within:border-blue-500 transition-all">
                                    <i className="fa-brands fa-github text-gray-400"></i>
                                    <input
                                        type="url"
                                        placeholder="GitHub URL"
                                        value={githubUrl}
                                        onChange={(e) => setGithubUrl(e.target.value)}
                                        className="bg-transparent outline-none w-28 text-[11px] text-gray-700"
                                    />
                                </div>
                                <div className="flex items-center gap-1.5 border border-gray-250 rounded-xl px-3 py-1.5 bg-gray-50 focus-within:border-blue-500 transition-all">
                                    <i className="fa-solid fa-globe text-gray-400"></i>
                                    <input
                                        type="url"
                                        placeholder="Live Demo URL"
                                        value={liveUrl}
                                        onChange={(e) => setLiveUrl(e.target.value)}
                                        className="bg-transparent outline-none w-28 text-[11px] text-gray-700"
                                    />
                                </div>
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
            </div>

            {/* Split Screen Workspace Area */}
            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Left Side: Markdown Editor */}
                <div className="w-1/2 flex flex-col border-r border-gray-200 h-full relative">
                    <EditorToolbar textareaRef={editorRef} value={markdownText} onChange={setMarkdownText} />
                    <textarea
                        ref={editorRef}
                        value={markdownText}
                        onChange={handleEditorChange}
                        onKeyDown={handleKeyDown}
                        onSelect={handleSelectionChange}
                        onKeyUp={handleSelectionChange}
                        placeholder="Compose your project documentation using Markdown..."
                        className="flex-1 p-6 pb-32 font-mono text-xs text-gray-800 bg-gray-50 outline-none resize-none leading-relaxed overflow-y-auto"
                    />

                    {/* Floating Tech Suggestions list */}
                    {showMentionPopup && filteredSuggestions.length > 0 && (
                        <div className="absolute bottom-4 left-4 z-40 w-48 bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col max-h-48 overflow-y-auto divide-y divide-gray-100 scale-in select-none">
                            <div className="px-3 py-1.5 bg-gray-50 text-[10px] text-gray-400 font-semibold tracking-wider uppercase shrink-0">
                                Tech Stack Badges
                            </div>
                            {filteredSuggestions.map((tech) => (
                                <button
                                    key={tech.name}
                                    type="button"
                                    onClick={() => handleSelectMention(tech)}
                                    className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-blue-50/50 transition-colors text-xs font-semibold"
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

                {/* Right Side: Live HTML Formatting Preview */}
                <div className="w-1/2 h-full bg-white">
                    <MarkdownPreview markdown={markdownText} />
                </div>
            </div>
        </div>
    );
}

export default CreatePostPage;
