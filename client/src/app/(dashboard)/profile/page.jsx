"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyProfile,
  updateMyProfile,
  updateAvatar,
  updateUserAccount,
  downloadProfilePdf,
} from "@/services/userService";
import { checkAuth } from "@/store/authSlice";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";
import Loader from "@/shared/components/Loader";

function ProfilePage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const currentUser = useSelector((state) => state.auth.user);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["myProfile"],
    queryFn: () => getMyProfile().then((res) => res.data),
  });

  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [currentPosition, setCurrentPosition] = useState("");
  const [skills, setSkills] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (profileData && !hasInitializedRef.current) {
      setHeadline(profileData.headline || "");
      setBio(profileData.bio || "");
      setCurrentPosition(profileData.currentPosition || "");
      setSkills((currentUser?.skills || []).join(", "));
      hasInitializedRef.current = true;
    }
  }, [profileData, currentUser?.skills]);

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      await updateMyProfile({ headline, bio, currentPosition });
      const skillList = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await updateUserAccount({ skills: skillList });
    },
    onSuccess: () => {
      setMessage("Profile updated successfully.");
      setError("");
      hasInitializedRef.current = false;
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      dispatch(checkAuth());
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
      setMessage("Avatar updated.");
      dispatch(checkAuth());
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Failed to upload avatar.");
    },
  });

  const handleDownloadPdf = async () => {
    if (!currentUser?._id) return;
    try {
      const res = await downloadProfilePdf(currentUser._id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${currentUser.username}-profile.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download PDF.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  const user = currentUser || profileData?.userId;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start gap-5 mb-6">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-200 shrink-0">
            <img
              src={resolveProfilePicture(user?.profilePicture)}
              alt={user?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-sm text-gray-500">@{user?.username}</p>
            <label className="inline-block mt-2 text-xs font-semibold text-blue-600 cursor-pointer hover:underline">
              Change photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) avatarMutation.mutate(file);
                }}
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="text-xs font-semibold border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50"
          >
            Download PDF
          </button>
        </div>

        {message && (
          <div className="mb-4 text-xs font-semibold text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Headline</label>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Full-stack developer building devConnect"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Current position</label>
            <input
              value={currentPosition}
              onChange={(e) => setCurrentPosition(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Skills (comma-separated)</label>
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="React, Node.js, MongoDB"
            />
          </div>
          <button
            type="button"
            disabled={saveProfileMutation.isPending}
            onClick={() => saveProfileMutation.mutate()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-5 py-2 text-sm disabled:opacity-50"
          >
            {saveProfileMutation.isPending ? "Saving..." : "Save profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
