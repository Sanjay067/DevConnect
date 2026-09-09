"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LandingNav from "@/features/landing/components/LandingNav";
import FeatureSection from "@/features/landing/components/FeatureSection";
import {
  HeroShowcaseMockup,
  EditorShowcaseMockup,
  RatingShowcaseMockup,
  ProfileShowcaseMockup,
  MessagingShowcaseMockup,
} from "@/features/landing/components/MockupVisuals";

export default function Home() {
  const router = useRouter();

  const [openIndex, setOpenIndex] = useState(null);

  const features = [
    {
      title: "Document Your Architecture",
      description:
        "Break down the system architecture you built using the Markdown Editor and clearly document how your project works.",
    },
    {
      title: "Get Developer Feedback",
      description:
        "Get feedback from other developers and let them rate your work on a scale of 1–10.",
    },
    {
      title: "Connect & Discuss",
      description:
        "Engage with developer write-ups, join discussions, and discover like-minded developers with similar interests.",
    },
    {
      title: "Build Your Portfolio",
      description:
        "Turn your profile into a portfolio showcasing your projects, skills, and work while receiving ratings from the developer community.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] selection:bg-[#00ff66] selection:text-black">
      {/* Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00ff66]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Hero Left Text */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                Showcase Your Projects<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff66] via-[#33ff85] to-cyan-400">
                  Get Rated by Peers
                </span> <br />
                Build Your Profile
              </h1>

              <div className="max-w-2xl">
                {features.map((feature, index) => {
                  const isOpen = openIndex === index;

                  return (
                    <div key={feature.title} className="border-b border-zinc-800">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="w-full py-5 flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-5">
                          <span className="text-sm text-zinc-500">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span className="text-lg font-medium text-white">
                            {feature.title}
                          </span>
                        </div>

                        <span className="text-xl text-zinc-500">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      {isOpen && (
                        <p className="pb-5 pl-12 pr-8 text-zinc-400 leading-relaxed">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => router.push("/auth?mode=signup")}
                  className="px-7 py-3.5 rounded-xl font-bold text-black bg-[#00ff66] hover:bg-[#00cc52] shadow-[0_0_30px_rgba(0,255,102,0.35)] hover:shadow-[0_0_40px_rgba(0,255,102,0.5)] transition-all flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                >
                  <span>Start building in public</span>
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </button>
              </div>
            </div>

            {/* Hero Right Visual Mockup */}
            <div className="lg:col-span-6">
              <HeroShowcaseMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Feature 1: Showcase Projects with Markdown (Text Left, Image Right) */}
      <FeatureSection
        id="showcase"
        reverse={false}
        badgeText="MARKDOWN EDITOR"
        badgeIcon="fa-solid fa-code"
        badgeColor="text-[#00ff66]"
        title="Document what you built, open for discussions"
        subtitle="Write clear technical breakdowns of your projects using a built-in markdown editor."
        bullets={[
          "Write clean posts with code blocks, lists, and formatted text",
          "Add screenshots, diagrams, and UI previews directly to your write-up",
          "Tag your tech stack so developers with similar interests can find it",
          "Discuss feedback and implementation details in comment threads",
        ]}
        visual={<EditorShowcaseMockup />}
      />

      {/* Feature 2: 1-10 Star Peer Review System (Image Left, Text Right) */}
      <FeatureSection
        id="ratings"
        reverse={true}
        badgeText="PEER RATINGS"
        badgeIcon="fa-solid fa-star"
        badgeColor="text-yellow-400"
        title="Get rated 1–10 by other developers"
        subtitle="Receive direct ratings and feedback on your work from developers who read your write-up."
        bullets={[
          "1 to 10 star rating system on every project",
          "See average ratings calculated across all reviews",
          "Self-rating is disabled to keep reviews genuine",
          "Find top-rated projects across different tech stacks",
        ]}
        visual={<RatingShowcaseMockup />}
      />

      {/* Feature 3: Portfolio-First Profile (Text Left, Image Right) */}
      <FeatureSection
        id="portfolio"
        reverse={false}
        badgeText="DEVELOPER PROFILE"
        badgeIcon="fa-solid fa-id-card"
        badgeColor="text-blue-400"
        title="Your developer profile, ready from day one.Share your clean profile link with peers and recruiters,"
        subtitle="Set up your profile during onboarding and turn it into a portfolio with your skills, projects, and links."
        bullets={[
          "Quick setup to fill your role, tech stack, and bio",
          "Pin your top-rated projects directly to your profile",
          "Add links to your GitHub, LinkedIn, and live demos",
        ]}
        visual={<ProfileShowcaseMockup />}
      />

      {/* Feature 4: Real-Time Messaging & Network (Image Left, Text Right) */}
      <FeatureSection
        id="realtime"
        reverse={true}
        badgeText="DIRECT MESSAGES"
        badgeIcon="fa-solid fa-bolt"
        badgeColor="text-purple-400"
        title="1-on-1 chats and developer discovery"
        subtitle="Message developers directly and find people working with the same tech stack."
        bullets={[
          "Start 1-on-1 chats to discuss projects or collaborate",
          "Find developers by skills and tech stack",
          "Get notified when someone replies or reaches out",
          "Start a conversation directly from any project or profile",
        ]}
        visual={<MessagingShowcaseMockup />}
      />

      {/* Bottom CTA Section */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-[#18181b] to-[#121214] border border-[#27272a] shadow-2xl relative">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#00ff66]/15 rounded-full blur-3xl pointer-events-none" />

            <span className="inline-block px-3 py-1 rounded-full bg-[#00ff66]/10 text-[#00ff66] text-xs font-mono mb-4 border border-[#00ff66]/30">
              JOIN THE DEVELOPER COMMUNITY
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to Share What You've Built?
            </h2>

            <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
              Join thousands of software engineers who showcase their code, gather honest peer feedback, and expand their technical reach on dev.connect.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => router.push("/auth?mode=signup")}
                className="px-8 py-4 rounded-xl font-bold text-black bg-[#00ff66] hover:bg-[#00cc52] shadow-[0_0_30px_rgba(0,255,102,0.4)] hover:shadow-[0_0_40px_rgba(0,255,102,0.6)] transition-all flex items-center gap-2 text-base cursor-pointer"
              >
                <span>Create Your Profile</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#27272a] bg-[#09090b] pt-14 pb-10 text-zinc-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 pb-10 border-b border-[#27272a]">
            {/* Left: Brand & Open Source Contribution */}
            <div className="space-y-4 max-w-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#18181b] border border-[#27272a]">
                  <img
                    src="/dev.connect.png"
                    alt="dev.connect logo"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold tracking-tight text-white">
                    dev.connect
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono -mt-1">
                    for developers
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                dev.connect is an open-source project. You can contribute to the platform, report issues, suggest ideas, or build features with us.
              </p>

              <div className="pt-1">
                <a
                  href="https://github.com/Sanjay067/devConnect"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#18181b] hover:bg-[#27272a] text-zinc-200 border border-[#27272a] hover:border-zinc-500 transition-all"
                >
                  <i className="fa-brands fa-github text-sm"></i>
                  <span>Contribute on GitHub</span>
                </a>
              </div>
            </div>

            {/* Right: Get Started */}
            <div className="space-y-3 min-w-[160px]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Get Started
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-400">
                <li>
                  <button
                    onClick={() => router.push("/auth?mode=signup")}
                    className="text-[#00ff66] hover:underline font-semibold cursor-pointer"
                  >
                    Create Account
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/auth?mode=login")}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                </li>
                <li>
                  <a
                    href="https://github.com/Sanjay067/devConnect"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <i className="fa-brands fa-github text-xs"></i>
                    GitHub Repository
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <p>© {new Date().getFullYear()} dev.connect. Open source for developers.</p>
            <p className="text-zinc-500">
              Built in public.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
