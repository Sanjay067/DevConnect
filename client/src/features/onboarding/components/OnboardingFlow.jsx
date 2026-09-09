"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkAuth } from "@/store/authSlice";
import {
  updateUserAccount,
  updateMyProfile,
  updateAvatar,
} from "@/services/userService";

import StepIdentity from "./StepIdentity";
import StepSkills from "./StepSkills";
import StepInterests from "./StepInterests";
import StepExperience from "./StepExperience";
import StepBioLinks from "./StepBioLinks";

const TOTAL_STEPS = 5;

export default function OnboardingFlow() {
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const currentUser = useSelector((state) => state.auth.user);

  const [step, setStep] = useState(1);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState(() => ({
    name: currentUser?.name || "",
    username: currentUser?.username || "",
    headline: currentUser?.headline || "",
    currentPosition: currentUser?.currentPosition || "",
    location: "",
    skills: currentUser?.skills || [],
    interests: currentUser?.interests || [],
    openForCollabs: true,
    pastWork: [],
    education: [],
    bio: currentUser?.bio || "",
    social: {
      github: "",
      linkedin: "",
      portfolio: "",
      twitter: "",
    },
    profilePicture: currentUser?.profilePicture || "",
  }));

  // Sync if currentUser loads asynchronously
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || currentUser.name || "",
        username: prev.username || currentUser.username || "",
        profilePicture: prev.profilePicture || currentUser.profilePicture || "",
        skills: prev.skills?.length ? prev.skills : currentUser.skills || [],
        interests: prev.interests?.length ? prev.interests : currentUser.interests || [],
      }));
    }
  }, [currentUser]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // 1. Prepare Social Links array
      const ensureHttps = (url = "") => {
        const trimmed = url.trim();
        if (!trimmed) return "";
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        return `https://${trimmed}`;
      };

      const socialLinks = [];
      if (formData.social?.github?.trim())
        socialLinks.push({ platform: "github", url: ensureHttps(formData.social.github) });
      if (formData.social?.linkedin?.trim())
        socialLinks.push({ platform: "linkedin", url: ensureHttps(formData.social.linkedin) });
      if (formData.social?.portfolio?.trim())
        socialLinks.push({ platform: "portfolio", url: ensureHttps(formData.social.portfolio) });
      if (formData.social?.twitter?.trim())
        socialLinks.push({ platform: "twitter", url: ensureHttps(formData.social.twitter) });

      // 2. Clean pastWork & education
      const filteredPastWork = (formData.pastWork || [])
        .map((w) => ({
          company: w.company?.trim() || "",
          position: w.position?.trim() || "",
          years: w.years?.trim() || "",
        }))
        .filter((w) => w.company || w.position || w.years);

      const filteredEducation = (formData.education || [])
        .map((e) => ({
          school: e.school?.trim() || "",
          degree: e.degree?.trim() || "",
          fieldOfStudy: e.fieldOfStudy?.trim() || "",
        }))
        .filter((e) => e.school || e.degree || e.fieldOfStudy);

      // 3. Update User account info
      await updateUserAccount({
        name: formData.name?.trim(),
        username: formData.username?.trim(),
        skills: formData.skills || [],
        interests: formData.interests || [],
      });

      // 4. Update Profile document
      await updateMyProfile({
        headline: formData.headline?.trim() || "",
        bio: formData.bio?.trim() || "",
        currentPosition: formData.currentPosition?.trim() || "",
        location: formData.location?.trim() || "",
        socialLinks,
        pastWork: filteredPastWork,
        education: filteredEducation,
        skills: formData.skills || [],
      });

      // 5. Upload avatar if selected
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append("avatar", avatarFile);
        await updateAvatar(avatarFormData);
      }
    },
    onSuccess: () => {
      setIsCompleted(true);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      dispatch(checkAuth());
    },
    onError: (err) => {
      setErrorMsg(
        err.response?.data?.message || err.message || "Failed to save profile. Please try again."
      );
    },
  });

  const handleNext = () => {
    setErrorMsg("");
    if (step === 1) {
      if (!formData.name?.trim()) {
        setErrorMsg("Please enter your name");
        return;
      }
      if (!formData.username?.trim()) {
        setErrorMsg("Please enter a username");
        return;
      }
      if (!formData.headline?.trim()) {
        setErrorMsg("Please enter or select a headline");
        return;
      }
    }

    if (step < TOTAL_STEPS) {
      setStep((prev) => prev + 1);
    } else {
      saveMutation.mutate();
    }
  };

  const handleBack = () => {
    setErrorMsg("");
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSkipToFeed = () => {
    router.push("/feed");
  };

  // Completion Success Screen
  if (isCompleted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{ background: "var(--bg)" }}
      >
        <div
          className="max-w-md w-full p-8 rounded-3xl border border-zinc-800 text-center space-y-6 animate-in zoom-in-95 duration-300"
          style={{
            background: "var(--surface)",
            boxShadow: "0 0 40px rgba(0, 255, 102, 0.1), 0 20px 40px rgba(0,0,0,0.8)",
          }}
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl text-emerald-400">
            <i className="fa-solid fa-circle-check animate-bounce"></i>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              You&apos;re all set, {formData.name || "Developer"}! 🎉
            </h2>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Your developer profile is fully customized and live. Connect with peers, showcase your repositories, and explore projects!
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/feed")}
              className="w-full py-3.5 rounded-xl font-bold text-black bg-[#00ff66] hover:bg-[#00cc52] shadow-[0_0_24px_rgba(0,255,102,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Discover Feed</span>
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>

            {currentUser?._id && (
              <button
                type="button"
                onClick={() => router.push(`/profile/${currentUser._id}`)}
                className="w-full py-3 rounded-xl font-semibold text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 transition-all cursor-pointer text-xs"
              >
                View My Profile
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div
      className="min-h-screen flex flex-col justify-between px-4 py-6 sm:py-10"
      style={{ background: "var(--bg)" }}
    >
      {/* Top Navigation */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-zinc-850">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <i className="fa-regular fa-compass text-base"></i>
          </div>
          <span className="text-base font-extrabold tracking-tight text-white">
            dev.connect <span className="text-xs text-emerald-400 font-mono font-medium ml-1">onboarding</span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleSkipToFeed}
          className="text-xs text-zinc-500 hover:text-zinc-300 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>Skip to feed</span>
          <i className="fa-solid fa-forward-step text-[10px]"></i>
        </button>
      </header>

      {/* Main Form Card */}
      <main className="max-w-3xl w-full mx-auto my-6 flex-1 flex flex-col justify-center">
        {/* Step Progress Bar */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>
              Step <strong className="text-white">{step}</strong> of {TOTAL_STEPS}
            </span>
            <span className="font-mono text-emerald-400">{progressPercent}% complete</span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Outer Card */}
        <div
          className="p-6 sm:p-10 rounded-3xl border border-zinc-800 relative overflow-hidden"
          style={{
            background: "var(--surface)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 24px 48px -12px rgba(0,0,0,0.7)",
          }}
        >
          {errorMsg && (
            <div className="mb-5 flex items-center gap-2 p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-xs text-red-400 animate-in fade-in">
              <i className="fa-solid fa-circle-exclamation shrink-0"></i>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Active Step Component */}
          {step === 1 && (
            <StepIdentity
              formData={formData}
              setFormData={setFormData}
              avatarPreview={avatarPreview}
              setAvatarPreview={setAvatarPreview}
              setAvatarFile={setAvatarFile}
            />
          )}

          {step === 2 && (
            <StepSkills formData={formData} setFormData={setFormData} />
          )}

          {step === 3 && (
            <StepInterests formData={formData} setFormData={setFormData} />
          )}

          {step === 4 && (
            <StepExperience formData={formData} setFormData={setFormData} />
          )}

          {step === 5 && (
            <StepBioLinks
              formData={formData}
              setFormData={setFormData}
              avatarPreview={avatarPreview}
            />
          )}

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between gap-4 pt-8 mt-8 border-t border-zinc-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={saveMutation.isPending}
                className="px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <i className="fa-solid fa-arrow-left text-[10px]"></i>
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={saveMutation.isPending}
              className="px-7 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                  <span>Saving Profile...</span>
                </>
              ) : step === TOTAL_STEPS ? (
                <>
                  <span>Complete & Launch Profile</span>
                  <i className="fa-solid fa-rocket text-xs"></i>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-zinc-600 pt-4">
        dev.connect • Open-source developer community & showcase
      </footer>
    </div>
  );
}
