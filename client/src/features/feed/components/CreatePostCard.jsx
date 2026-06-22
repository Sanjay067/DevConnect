import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useCreatePost } from "../hooks/useFeed";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";

function CreatePostCard() {
    const currentUser = useSelector((state) => state.auth.user);
    const { mutate: createPostMutation, isPending } = useCreatePost();
    const [isOpen, setIsOpen] = useState(false);

    // Form states
    const [title, setTitle] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [contentText, setContentText] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [liveUrl, setLiveUrl] = useState("");
    const [techInput, setTechInput] = useState("");
    const [techStack, setTechStack] = useState([]);
    const [lookingForContributors, setLookingForContributors] = useState(false);
    
    // Media upload states
    const [mediaFiles, setMediaFiles] = useState([]);
    const [mediaPreviews, setMediaPreviews] = useState([]);
    const fileInputRef = useRef(null);

    // Errors
    const [errorMsg, setErrorMsg] = useState("");

    const handleClose = () => {
        setIsOpen(false);
        setTitle("");
        setShortDescription("");
        setContentText("");
        setGithubUrl("");
        setLiveUrl("");
        setTechInput("");
        setTechStack([]);
        setLookingForContributors(false);
        setMediaFiles([]);
        // Clean up preview object URLs
        mediaPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
        setMediaPreviews([]);
        setErrorMsg("");
    };

    const handleAddTechTag = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const tag = techInput.trim().toLowerCase();
            if (tag && !techStack.includes(tag)) {
                setTechStack([...techStack, tag]);
            }
            setTechInput("");
        }
    };

    const handleRemoveTechTag = (tagToRemove) => {
        setTechStack(techStack.filter((t) => t !== tagToRemove));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (mediaFiles.length + files.length > 5) {
            setErrorMsg("You can attach up to 5 media files.");
            return;
        }
        
        const newFiles = [...mediaFiles, ...files];
        setMediaFiles(newFiles);

        const newPreviews = files.map((file) => ({
            name: file.name,
            type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file",
            url: URL.createObjectURL(file),
        }));
        setMediaPreviews([...mediaPreviews, ...newPreviews]);
    };

    const handleRemoveFile = (index) => {
        const updatedFiles = [...mediaFiles];
        updatedFiles.splice(index, 1);
        setMediaFiles(updatedFiles);

        const updatedPreviews = [...mediaPreviews];
        URL.revokeObjectURL(updatedPreviews[index].url);
        updatedPreviews.splice(index, 1);
        setMediaPreviews(updatedPreviews);
    };

    const handleSubmit = () => {
        if (!title.trim()) {
            setErrorMsg("Post title is required.");
            return;
        }
        if (!contentText.trim()) {
            setErrorMsg("Project details write-up is required.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("shortDescription", shortDescription.trim());
        formData.append("lookingForContributors", lookingForContributors);

        // Package content text into the EditorJS block structure expected by the server schema
        const contentObj = {
            blocks: [
                {
                    type: "paragraph",
                    data: {
                        text: contentText.trim(),
                    },
                },
            ],
        };
        formData.append("content", JSON.stringify(contentObj));

        // Package links
        const linksArray = [];
        if (githubUrl.trim()) {
            linksArray.push({ url: githubUrl.trim(), label: "Github" });
        }
        if (liveUrl.trim()) {
            linksArray.push({ url: liveUrl.trim(), label: "Live Demo" });
        }
        formData.append("links", JSON.stringify(linksArray));

        // Package tech stack
        formData.append("techStack", JSON.stringify(techStack));

        // Append media files
        mediaFiles.forEach((file) => {
            formData.append("media", file);
        });

        createPostMutation(formData, {
            onSuccess: () => {
                handleClose();
            },
            onError: (err) => {
                setErrorMsg(err.response?.data?.message || "Failed to publish post.");
            },
        });
    };

    return (
        <div className="w-full max-w-2xl mx-auto my-4">
            {/* Inline Trigger Card */}
            <div className="w-full rounded-2xl p-5 bg-white border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
                        {currentUser?.profilePicture ? (
                            <img
                                src={resolveProfilePicture(currentUser.profilePicture)}
                                alt={currentUser?.name || "Me"}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-yellow-500"></div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex-1 text-left bg-gray-50 hover:bg-gray-100/70 border border-gray-200 rounded-full px-5 py-2.5 text-gray-500 text-sm font-medium transition-colors"
                    >
                        Showcase a new project...
                    </button>
                </div>

                <div className="flex items-center gap-6 pt-3 mt-3 border-t border-gray-50 text-gray-500 text-xs font-semibold">
                    <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                        <i className="fa-regular fa-image text-blue-500 text-sm"></i>
                        Media
                    </button>
                    <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 hover:text-green-600 transition-colors">
                        <i className="fa-solid fa-code text-green-500 text-sm"></i>
                        Tech Stack
                    </button>
                    <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                        <i className="fa-solid fa-link text-indigo-500 text-sm"></i>
                        Links
                    </button>
                    <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 hover:text-yellow-600 transition-colors ml-auto">
                        <i className="fa-regular fa-handshake text-yellow-500 text-sm"></i>
                        Looking for Contributors
                    </button>
                </div>
            </div>

            {/* Modal Dialog */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-gray-100 flex flex-col max-h-[90vh] transition-transform animate-fade-in">
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
                            <h2 className="font-bold text-gray-900 text-lg">Share Your Project</h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-semibold leading-none"
                            >
                                &times;
                            </button>
                        </div>
                        
                        {/* Scrollable Form Body */}
                        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 text-sm text-gray-700">
                            {errorMsg && (
                                <div className="bg-red-50 text-red-600 rounded-lg p-3 text-xs font-semibold leading-tight border border-red-100">
                                    {errorMsg}
                                </div>
                            )}

                            {/* Author Info */}
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200">
                                    {currentUser?.profilePicture ? (
                                        <img
                                            src={resolveProfilePicture(currentUser.profilePicture)}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-yellow-500"></div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 leading-tight">{currentUser?.name}</h4>
                                    <p className="text-xs text-gray-400 font-medium leading-none mt-0.5">@{currentUser?.username}</p>
                                </div>
                            </div>

                            {/* Project Title */}
                            <input
                                type="text"
                                placeholder="Project Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border-b border-gray-200 py-2 font-bold text-lg text-gray-900 outline-none focus:border-blue-500 transition-colors"
                            />

                            {/* Short Tagline Description */}
                            <textarea
                                placeholder="Tagline / Short description (up to 200 chars)..."
                                value={shortDescription}
                                onChange={(e) => setShortDescription(e.target.value)}
                                maxLength={200}
                                rows={2}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-blue-500 transition-colors resize-none text-xs text-gray-600"
                            />

                            {/* Content (Detailed write-up) */}
                            <textarea
                                placeholder="Describe your project, goals, key features, and background details..."
                                value={contentText}
                                onChange={(e) => setContentText(e.target.value)}
                                rows={5}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-blue-500 transition-colors resize-none text-xs text-gray-700"
                            />

                            {/* Links */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus-within:border-blue-500 transition-all">
                                    <i className="fa-brands fa-github text-gray-400 text-base"></i>
                                    <input
                                        type="url"
                                        placeholder="GitHub Link"
                                        value={githubUrl}
                                        onChange={(e) => setGithubUrl(e.target.value)}
                                        className="bg-transparent outline-none w-full text-xs text-gray-700"
                                    />
                                </div>
                                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus-within:border-blue-500 transition-all">
                                    <i className="fa-solid fa-globe text-gray-400 text-base"></i>
                                    <input
                                        type="url"
                                        placeholder="Live Demo Link"
                                        value={liveUrl}
                                        onChange={(e) => setLiveUrl(e.target.value)}
                                        className="bg-transparent outline-none w-full text-xs text-gray-700"
                                    />
                                </div>
                            </div>

                            {/* Tech Tag Input */}
                            <div className="flex flex-col gap-2">
                                <label className="font-semibold text-xs text-gray-600 leading-none">Tech Stack</label>
                                <input
                                    type="text"
                                    placeholder="Add technology (e.g. React, Node, Python) and press Enter..."
                                    value={techInput}
                                    onChange={(e) => setTechInput(e.target.value)}
                                    onKeyDown={handleAddTechTag}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors"
                                />
                                {techStack.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {techStack.map((tech) => (
                                            <span
                                                key={tech}
                                                className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 capitalize"
                                            >
                                                {tech}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTechTag(tech)}
                                                    className="hover:text-blue-800 text-[10px] font-bold"
                                                >
                                                    &times;
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Media File Upload */}
                            <div className="flex flex-col gap-2">
                                <label className="font-semibold text-xs text-gray-600 leading-none">Showcase Media (Up to 5)</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-gray-50/50 flex flex-col items-center justify-center gap-1.5"
                                >
                                    <i className="fa-regular fa-images text-gray-400 text-xl"></i>
                                    <span className="text-xs text-gray-500 font-medium">Click to upload images/videos</span>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {/* Previews Grid */}
                                {mediaPreviews.length > 0 && (
                                    <div className="grid grid-cols-5 gap-2 mt-2">
                                        {mediaPreviews.map((preview, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-150 group">
                                                {preview.type === "image" ? (
                                                    <img src={preview.url} alt="" className="w-full h-full object-cover" />
                                                ) : preview.type === "video" ? (
                                                    <video src={preview.url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[10px]">
                                                        File
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFile(idx)}
                                                    className="absolute top-1 right-1 w-4 h-4 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-[10px] font-bold transition-colors"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Looking for contributors Toggle */}
                            <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                                <div>
                                    <h5 className="font-semibold text-gray-800 text-xs leading-tight">Looking for Contributors</h5>
                                    <p className="text-[10px] text-gray-400 leading-normal mt-0.5">Let peers know you want collaborators for this project.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={lookingForContributors}
                                        onChange={(e) => setLookingForContributors(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isPending}
                                className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-full text-xs transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isPending}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-full text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {isPending ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                                        Publishing...
                                    </>
                                ) : (
                                    "Publish Post"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreatePostCard;
