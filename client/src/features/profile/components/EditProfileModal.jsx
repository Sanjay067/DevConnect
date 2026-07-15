"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMyProfile, updateAvatar, updateUserAccount } from "@/services/userService";
import { checkAuth } from "@/store/authSlice";
import { getNormalizedLinks } from "@/shared/lib/socialLinks";

export default function EditProfileModal({ isOpen, onClose, initialData, userId }) {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const [headline, setHeadline] = useState(() => initialData?.headline || "");
    const [bio, setBio] = useState(() => initialData?.bio || "");
    const [currentPosition, setCurrentPosition] = useState(() => initialData?.currentPosition || "");
    const [location, setLocation] = useState(() => initialData?.location || "");
    const [skills, setSkills] = useState(() => (initialData?.skills || []).join(", "));
    
    // Social Links
    const [socialLinks, setSocialLinks] = useState(() => getNormalizedLinks(initialData?.socialLinks));

    // Work Experience
    const [pastWork, setPastWork] = useState(() => initialData?.pastWork || []);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const saveProfileMutation = useMutation({
        mutationFn: async () => {
            const skillList = skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

            // Filter out empty experience items
            const filteredPastWork = pastWork
                .map((w) => ({
                    company: w.company?.trim() || "",
                    position: w.position?.trim() || "",
                    years: w.years?.trim() || "",
                }))
                .filter((w) => w.company || w.position || w.years);

            // Filter out empty social links
            const filteredSocialLinks = socialLinks
                .map((link) => ({
                    platform: link.platform || "custom",
                    url: link.url?.trim() || "",
                }))
                .filter((link) => link.url);

            await updateMyProfile({ 
                headline, 
                bio, 
                currentPosition, 
                location,
                socialLinks: filteredSocialLinks,
                pastWork: filteredPastWork,
                skills: skillList
            });

            await updateUserAccount({ skills: skillList });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile", userId] });
            dispatch(checkAuth());
            onClose();
        },
        onError: (err) => {
            setError(err.response?.data?.message || "Failed to update profile.");
            setMessage("");
        },
    });

    const avatarMutation = useMutation({
        mutationFn: (file) => {
            const formData = new FormData();
            formData.append("avatar", file);
            return updateAvatar(formData);
        },
        onSuccess: () => {
            setMessage("Avatar updated successfully.");
            queryClient.invalidateQueries({ queryKey: ["profile", userId] });
            dispatch(checkAuth());
        },
        onError: (err) => {
            setError(err.response?.data?.message || "Failed to upload avatar.");
        },
    });

    const handleAddExperience = () => {
        setPastWork([...pastWork, { company: "", position: "", years: "" }]);
    };

    const handleRemoveExperience = (index) => {
        setPastWork(pastWork.filter((_, idx) => idx !== index));
    };

    const handleExperienceChange = (index, field, value) => {
        const updated = pastWork.map((item, idx) => {
            if (idx === index) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setPastWork(updated);
    };

    const handleAddSocialLink = () => {
        if (socialLinks.length < 6) {
            setSocialLinks([...socialLinks, { platform: "github", url: "" }]);
        }
    };

    const handleRemoveSocialLink = (index) => {
        setSocialLinks(socialLinks.filter((_, idx) => idx !== index));
    };

    const handleSocialLinkChange = (index, field, value) => {
        const updated = socialLinks.map((item, idx) => {
            if (idx === index) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setSocialLinks(updated);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/20">
                    <h3 className="text-sm font-bold text-zinc-100">Edit Profile Details</h3>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-zinc-300 w-8 h-8 rounded-lg hover:bg-zinc-850 flex items-center justify-center cursor-pointer transition-colors"
                    >
                        <i className="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>

                {/* Form Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {message && (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-400">
                            <i className="fa-solid fa-circle-check"></i> {message}
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                            <i className="fa-solid fa-circle-exclamation"></i> {error}
                        </div>
                    )}

                    {/* Avatar Upload */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-zinc-900/20 border border-zinc-850 rounded-2xl">
                        <div className="w-16 h-16 rounded-full border border-zinc-750 overflow-hidden shrink-0">
                            {initialData?.userId?.profilePicture ? (
                                <img
                                    src={initialData.userId.profilePicture}
                                    alt="Avatar preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800" />
                            )}
                        </div>
                        <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
                            <p className="text-xs font-bold text-zinc-200">Profile Display Avatar</p>
                            <p className="text-[10px] text-zinc-500 max-w-sm">JPG or PNG format. Recommend square dimensions of at least 200x200px.</p>
                            <label className="inline-block px-3 py-1.5 text-[10px] font-extrabold bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-300 hover:text-white rounded-lg cursor-pointer transition-colors shadow-sm mt-1">
                                {avatarMutation.isPending ? "Uploading..." : "Upload New Image"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={avatarMutation.isPending}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) avatarMutation.mutate(file);
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Headline */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Headline / Job Title</label>
                            <input
                                value={headline}
                                onChange={(e) => setHeadline(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-zinc-650"
                                placeholder="Full Stack Developer | React Architect"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Location</label>
                            <input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-zinc-650"
                                placeholder="New York, USA (or Remote)"
                            />
                        </div>

                        {/* Current Position */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Current Position</label>
                            <input
                                value={currentPosition}
                                onChange={(e) => setCurrentPosition(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-zinc-650"
                                placeholder="Senior Software Engineer at Google"
                            />
                        </div>

                        {/* Biography */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Biography / Brief Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-zinc-650 resize-none"
                                placeholder="Write a short summary about your background, passion, or current projects..."
                            />
                        </div>

                        {/* Tech Stack */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Tech Stack & Skills (Comma-separated)</label>
                            <input
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-zinc-650"
                                placeholder="React, Node.js, Python, AWS"
                            />
                        </div>

                        {/* Social Links Subgroup */}
                        <div className="pt-4 border-t border-zinc-900">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold text-zinc-300">Social & Web Links</h4>
                                <button
                                    type="button"
                                    onClick={handleAddSocialLink}
                                    disabled={socialLinks.length >= 6}
                                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                    <i className="fa-solid fa-plus text-[10px]"></i> Add Link ({socialLinks.length}/6)
                                </button>
                            </div>

                            <div className="space-y-3">
                                {socialLinks.map((link, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-zinc-900/20 border border-zinc-800 rounded-xl relative">
                                        <select
                                            value={link.platform}
                                            onChange={(e) => handleSocialLinkChange(idx, "platform", e.target.value)}
                                            className="bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50 cursor-pointer"
                                        >
                                            <option value="github">GitHub</option>
                                            <option value="linkedin">LinkedIn</option>
                                            <option value="leetcode">LeetCode</option>
                                            <option value="twitter">Twitter / X</option>
                                            <option value="youtube">YouTube</option>
                                            <option value="portfolio">Portfolio</option>
                                            <option value="custom">Website / Custom</option>
                                        </select>
                                        
                                        <input
                                            value={link.url}
                                            onChange={(e) => handleSocialLinkChange(idx, "url", e.target.value)}
                                            className="flex-1 bg-zinc-950 border border-zinc-855 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
                                            placeholder="URL (e.g. https://...)"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSocialLink(idx)}
                                            className="text-zinc-500 hover:text-red-400 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-850 self-end sm:self-center"
                                        >
                                            <i className="fa-solid fa-trash-can text-xs"></i>
                                        </button>
                                    </div>
                                ))}
                                {socialLinks.length === 0 && (
                                    <p className="text-[11px] text-zinc-600 italic">No social profiles linked yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Experience Subgroup */}
                        <div className="pt-4 border-t border-zinc-900">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold text-zinc-300">Work Experience</h4>
                                <button
                                    type="button"
                                    onClick={handleAddExperience}
                                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                                >
                                    <i className="fa-solid fa-plus text-[10px]"></i> Add Experience
                                </button>
                            </div>

                            <div className="space-y-3">
                                {pastWork.map((work, idx) => (
                                    <div key={idx} className="p-3 bg-zinc-900/20 border border-zinc-800 rounded-xl space-y-2 relative">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExperience(idx)}
                                            className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-zinc-850"
                                        >
                                            <i className="fa-solid fa-trash-can text-xs"></i>
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pr-6">
                                            <input
                                                value={work.company}
                                                onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                                                className="bg-zinc-950 border border-zinc-855 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
                                                placeholder="Company Name"
                                            />
                                            <input
                                                value={work.position}
                                                onChange={(e) => handleExperienceChange(idx, "position", e.target.value)}
                                                className="bg-zinc-950 border border-zinc-855 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
                                                placeholder="Position (e.g. Frontend Dev)"
                                            />
                                            <input
                                                value={work.years}
                                                onChange={(e) => handleExperienceChange(idx, "years", e.target.value)}
                                                className="bg-zinc-950 border border-zinc-855 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
                                                placeholder="Tenure / Years (e.g. 2024 - Present)"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {pastWork.length === 0 && (
                                    <p className="text-[11px] text-zinc-600 italic">No experience entries added yet.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => saveProfileMutation.mutate()}
                        disabled={saveProfileMutation.isPending}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl px-6 py-2 text-xs transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                        {saveProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
