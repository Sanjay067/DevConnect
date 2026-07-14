"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMyProfile, updateAvatar, updateUserAccount } from "@/services/userService";
import { checkAuth } from "@/store/authSlice";

export default function EditProfileModal({ isOpen, onClose, initialData, userId }) {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const [headline, setHeadline] = useState(() => initialData?.headline || "");
    const [bio, setBio] = useState(() => initialData?.bio || "");
    const [currentPosition, setCurrentPosition] = useState(() => initialData?.currentPosition || "");
    const [location, setLocation] = useState(() => initialData?.location || "");
    const [skills, setSkills] = useState(() => (initialData?.skills || []).join(", "));
    
    // Social Links
    const [github, setGithub] = useState(() => initialData?.socialLinks?.github || "");
    const [linkedin, setLinkedin] = useState(() => initialData?.socialLinks?.linkedin || "");
    const [portfolio, setPortfolio] = useState(() => initialData?.socialLinks?.portfolio || "");

    // Education
    const [education, setEducation] = useState(() => initialData?.education || []);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const saveProfileMutation = useMutation({
        mutationFn: async () => {
            const skillList = skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

            await updateMyProfile({ 
                headline, 
                bio, 
                currentPosition, 
                location,
                socialLinks: { github, linkedin, portfolio },
                education,
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

    const handleAddEducation = () => {
        setEducation([...education, { school: "", degree: "", fieldOfStudy: "" }]);
    };

    const handleRemoveEducation = (index) => {
        setEducation(education.filter((_, idx) => idx !== index));
    };

    const handleEducationChange = (index, field, value) => {
        const updated = education.map((edu, idx) => {
            if (idx === index) {
                return { ...edu, [field]: value };
            }
            return edu;
        });
        setEducation(updated);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
                    <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                        <i className="fa-solid fa-pen-to-square text-emerald-500"></i>
                        Edit Profile
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-850">
                        <i className="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/80">
                        <div>
                            <h3 className="text-xs font-semibold text-zinc-200">Profile Picture</h3>
                            <p className="text-[11px] text-zinc-505 text-zinc-500 mt-1">Upload a new avatar to update your identity.</p>
                        </div>
                        <label className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl cursor-pointer transition-colors border border-zinc-700/50">
                            <i className="fa-solid fa-camera"></i>
                            {avatarMutation.isPending ? "Uploading..." : "Change Photo"}
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

                    {message && (
                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded-xl px-4 py-3">
                            <i className="fa-solid fa-circle-check"></i> {message}
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-2 text-xs font-medium text-red-400 bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-3">
                            <i className="fa-solid fa-triangle-exclamation"></i> {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Profile Info Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Headline</label>
                                <input
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-zinc-650"
                                    placeholder="e.g. Full-stack Developer at DevConnect"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Current Position</label>
                                <input
                                    value={currentPosition}
                                    onChange={(e) => setCurrentPosition(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-zinc-650"
                                    placeholder="e.g. Software Engineer"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Location</label>
                            <input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-zinc-650"
                                placeholder="e.g. San Francisco, CA"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">About Me (Bio)</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-y placeholder-zinc-650"
                                placeholder="Tell the community about yourself..."
                            />
                        </div>

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
                            <h4 className="text-xs font-bold text-zinc-300 mb-3">Social & Web Links</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center shrink-0">
                                        <i className="fa-brands fa-github text-zinc-400"></i>
                                    </span>
                                    <input
                                        value={github}
                                        onChange={(e) => setGithub(e.target.value)}
                                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                        placeholder="GitHub profile URL"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center shrink-0">
                                        <i className="fa-brands fa-linkedin text-zinc-400"></i>
                                    </span>
                                    <input
                                        value={linkedin}
                                        onChange={(e) => setLinkedin(e.target.value)}
                                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                        placeholder="LinkedIn profile URL"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center justify-center shrink-0">
                                        <i className="fa-solid fa-link text-zinc-400"></i>
                                    </span>
                                    <input
                                        value={portfolio}
                                        onChange={(e) => setPortfolio(e.target.value)}
                                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                        placeholder="Portfolio or personal website URL"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Education Subgroup */}
                        <div className="pt-4 border-t border-zinc-900">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold text-zinc-300">Education</h4>
                                <button
                                    type="button"
                                    onClick={handleAddEducation}
                                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                                >
                                    <i className="fa-solid fa-plus text-[10px]"></i> Add Education
                                </button>
                            </div>

                            <div className="space-y-3">
                                {education.map((edu, idx) => (
                                    <div key={idx} className="p-3 bg-zinc-900/20 border border-zinc-800 rounded-xl space-y-2 relative">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveEducation(idx)}
                                            className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-zinc-850"
                                        >
                                            <i className="fa-solid fa-trash-can text-xs"></i>
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pr-6">
                                            <input
                                                value={edu.school}
                                                onChange={(e) => handleEducationChange(idx, "school", e.target.value)}
                                                className="bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
                                                placeholder="School / University"
                                            />
                                            <input
                                                value={edu.degree}
                                                onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                                                className="bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
                                                placeholder="Degree (e.g. BS)"
                                            />
                                            <input
                                                value={edu.fieldOfStudy}
                                                onChange={(e) => handleEducationChange(idx, "fieldOfStudy", e.target.value)}
                                                className="bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
                                                placeholder="Field of Study"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {education.length === 0 && (
                                    <p className="text-[11px] text-zinc-600 italic">No education entries added yet.</p>
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
