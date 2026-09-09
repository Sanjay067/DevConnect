"use client";

import React from "react";
import PostCard from "@/features/feed/components/PostCard";

const DEMO_POST = {
  _id: "demo-post-1",
  title: "HyperPulse: Real-time Event Streaming Engine in Rust ⚡",
  shortDescription:
    "Architected a lock-free append-only log with sub-millisecond p99 latency. Integrated zero-copy serialization with Raft consensus.",
  lookingForContributors: true,
  author: {
    _id: "demo-author-1",
    name: "Suhas J",
    username: "suhasdev",
    profilePicture: null,
  },
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  techStack: ["rust", "docker", "websockets", "redis"],
  links: [
    { label: "Github", url: "https://github.com" },
    { label: "Live Demo", url: "https://demo.dev" },
  ],
  averageRating: 9.8,
  ratingCount: 24,
  userRatingScore: 9,
  commentCount: 14,
  content: {
    blocks: [
      {
        type: "paragraph",
        data: {
          text: "HyperPulse is a high-throughput event streamer engineered for distributed workloads.",
        },
      },
    ],
  },
};

// Mockup 1: Hero Interactive Project Card
export function HeroShowcaseMockup({ imageSrc }) {
  if (imageSrc) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-[#27272a] shadow-2xl bg-[#18181b] group">
        <img
          src={imageSrc}
          alt="dev.connect Hero Showcase"
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/80 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Glow highlight */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00ff66]/10 rounded-full blur-3xl pointer-events-none" />
      <PostCard post={DEMO_POST} showMenu={false} />
    </div>
  );
}

// Mockup 2: Markdown & Editor Showcase
export function EditorShowcaseMockup({ imageSrc }) {
  if (imageSrc) {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#27272a] shadow-2xl bg-[#18181b] group">
        <img
          src={imageSrc}
          alt="Markdown Editor Showcase"
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-5 sm:p-6 shadow-2xl space-y-4">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
        <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
          <span className="p-1.5 rounded hover:bg-[#27272a] text-white"><i className="fa-solid fa-bold"></i></span>
          <span className="p-1.5 rounded hover:bg-[#27272a] text-white"><i className="fa-solid fa-italic"></i></span>
          <span className="p-1.5 rounded hover:bg-[#27272a] text-white"><i className="fa-solid fa-code"></i></span>
          <span className="p-1.5 rounded hover:bg-[#27272a] text-white"><i className="fa-solid fa-heading"></i></span>
          <span className="p-1.5 rounded hover:bg-[#27272a] text-white"><i className="fa-solid fa-list"></i></span>
          <span className="p-1.5 rounded hover:bg-[#27272a] text-white"><i className="fa-solid fa-image"></i></span>
        </div>

      </div>

      {/* Editor Content split / sample */}
      <div className="space-y-3 font-mono text-xs">
        <div className="text-zinc-400">
          <span className="text-pink-400">##</span> System Architecture Overview
        </div>
        <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] text-zinc-300">
          <p className="text-zinc-400 mb-2">We built the ingestion pipeline using @[Next.js] and @[Redis]:</p>
          <div className="text-yellow-400">```typescript</div>
          <div className="text-zinc-300 pl-4">const cluster = new DistributedEngine({`{`}<br />&nbsp;&nbsp;replicas: 4,<br />&nbsp;&nbsp;heartbeatMs: 250<br />{`}`});</div>
          <div className="text-yellow-400">```</div>
        </div>

        {/* Autocomplete Popup Simulation */}
        <div className="p-3 rounded-xl bg-[#27272a] border border-[#00ff66]/40 shadow-xl max-w-xs space-y-1.5">
          <div className="text-[11px] text-zinc-400 font-sans flex items-center justify-between">
            <span>Tag Technology Stack</span>
            <span className="text-[10px] text-[#00ff66]">@query</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 p-1.5 rounded bg-[#00ff66]/20 text-white text-xs border border-[#00ff66]/40">
              <i className="fa-brands fa-react text-[#00ff66]"></i>
              <span className="font-semibold">React.js</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded hover:bg-[#18181b] text-zinc-300 text-xs">
              <i className="fa-brands fa-node-js text-emerald-400"></i>
              <span>Node.js</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded hover:bg-[#18181b] text-zinc-300 text-xs">
              <i className="fa-brands fa-golang text-cyan-400"></i>
              <span>Golang</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mockup 3: Ratings & Peer Review Showcase
export function RatingShowcaseMockup({ imageSrc }) {
  const [userScore, setUserScore] = React.useState(9);
  const [hoveredScore, setHoveredScore] = React.useState(null);
  const [delta, setDelta] = React.useState(null);

  const SCORE_LABELS = {
    1: "Needs Work",
    2: "Poor",
    3: "Fair",
    4: "Average",
    5: "Decent",
    6: "Good",
    7: "Very Good",
    8: "Great",
    9: "Outstanding",
    10: "Excellent",
  };

  // 14 existing peer ratings totalling 131.0 points (~9.36 avg)
  const basePeerPoints = 131.0;
  const basePeerCount = 14;

  const currentActiveScore = hoveredScore ?? userScore;
  const displayedAvg = ((basePeerPoints + currentActiveScore) / (basePeerCount + 1)).toFixed(1);

  const handleSelectScore = (score) => {
    const prevAvg = ((basePeerPoints + userScore) / (basePeerCount + 1));
    const newAvg = ((basePeerPoints + score) / (basePeerCount + 1));
    const diff = Number((newAvg - prevAvg).toFixed(1));

    setUserScore(score);
    if (diff !== 0) {
      setDelta(diff > 0 ? `+${diff}` : `${diff}`);
      setTimeout(() => setDelta(null), 1200);
    }
  };

  if (imageSrc) {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#27272a] shadow-2xl bg-[#18181b] group">
        <img
          src={imageSrc}
          alt="1-10 Star Peer Rating Mockup"
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-6 sm:p-7 shadow-2xl space-y-6">
      {/* Top score breakdown */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Live Aggregate Rating
          </span>
          <div className="flex items-baseline gap-2.5 mt-1">
            <h4 className="text-3xl sm:text-4xl font-extrabold text-white transition-all font-mono">
              {displayedAvg}
            </h4>
            <span className="text-sm font-medium text-zinc-400">/ 10</span>
            {delta && (
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md animate-pulse ${delta.startsWith("+")
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-red-500/20 text-red-400 border border-red-500/40"
                  }`}
              >
                {delta}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono bg-yellow-400/10 text-yellow-400 rounded-lg border border-yellow-400/30">
            <i className="fa-solid fa-star text-[11px]"></i> 15 Peer Reviews
          </span>
          <p className="text-[11px] text-zinc-500 mt-1">Self-ratings blocked</p>
        </div>
      </div>

      {/* Interactive 1-10 Selector Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0e0e11] border border-[#27272a] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium flex items-center gap-1.5">
            <i className="fa-solid fa-hand-pointer text-[#00ff66]"></i>
            Test rating this project:
          </span>
          <span className="font-mono text-sm font-bold text-yellow-400 transition-colors">
            ★ {currentActiveScore}/10 — {SCORE_LABELS[currentActiveScore]}
          </span>
        </div>

        {/* 1-10 buttons */}
        <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
            const isFilled = score <= currentActiveScore;
            const isSelected = score === userScore;
            return (
              <button
                key={score}
                type="button"
                onMouseEnter={() => setHoveredScore(score)}
                onMouseLeave={() => setHoveredScore(null)}
                onClick={() => handleSelectScore(score)}
                className={`h-9 sm:h-10 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center border cursor-pointer ${isFilled
                    ? "bg-yellow-400/20 border-yellow-400/80 text-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.25)]"
                    : "bg-[#18181b] border-[#27272a] text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                  } ${isSelected ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-[#0e0e11]" : ""}`}
              >
                {score}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating Details Footer */}
      <div className="pt-2 border-t border-[#27272a]/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00ff66]"></span>
          <span>Click any star above to see the aggregate average recalculate live.</span>
        </div>
      </div>
    </div>
  );
}

// Mockup 4: Developer Portfolio & Top-3 Showcase
export function ProfileShowcaseMockup({ imageSrc }) {
  if (imageSrc) {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#27272a] shadow-2xl bg-[#18181b] group">
        <img
          src={imageSrc}
          alt="Portfolio Profile Showcase"
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#18181b] overflow-hidden shadow-2xl">
      {/* Banner */}
      <div className="h-28 bg-gradient-to-r from-emerald-900/60 via-cyan-900/50 to-purple-900/60 relative p-4 flex justify-between items-start">
        <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-black/60 text-white backdrop-blur-sm border border-white/10">
          Featured Portfolio
        </span>
        <div className="flex gap-2">
          <span className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-xs text-white">
            <i className="fa-brands fa-github"></i>
          </span>
          <span className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-xs text-white">
            <i className="fa-brands fa-linkedin"></i>
          </span>
        </div>
      </div>

      {/* Profile Header */}
      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex justify-between items-end -mt-10 mb-4">
          <div className="w-20 h-20 rounded-2xl bg-[#09090b] border-4 border-[#18181b] overflow-hidden flex items-center justify-center font-bold text-xl text-[#00ff66] shadow-xl">
            SK
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#27272a] text-white border border-[#3f3f46]">
              342 Followers
            </span>
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/30">
              ★ 1,280 Pts
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-bold text-white">Sanjay K</h4>
          <p className="text-xs text-zinc-400">Full-Stack Cloud Architect • Bengaluru, IN</p>
        </div>

        {/* Top-3 Pinned Projects Showcase */}
        <div className="mt-4 pt-4 border-t border-[#27272a] space-y-2.5">
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
            <i className="fa-solid fa-thumbtack text-yellow-400 text-[10px]"></i>
            Top 3 Pinned Projects
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-[#09090b] border border-[#27272a] hover:border-[#00ff66]/40 transition-colors">
              <span className="text-xs font-semibold text-white truncate block">AutoK8s Mesh</span>
              <span className="text-[10px] text-zinc-400">★ 9.6 • Rust/Go</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#09090b] border border-[#27272a] hover:border-[#00ff66]/40 transition-colors">
              <span className="text-xs font-semibold text-white truncate block">VectorQuery DB</span>
              <span className="text-[10px] text-zinc-400">★ 9.4 • C++</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#09090b] border border-[#27272a] hover:border-[#00ff66]/40 transition-colors">
              <span className="text-xs font-semibold text-white truncate block">DevMetrics</span>
              <span className="text-[10px] text-zinc-400">★ 9.1 • Next.js</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mockup 5: Real-Time Messaging & Network
export function MessagingShowcaseMockup({ imageSrc = "/messages-sample.png" }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#27272a] shadow-2xl bg-[#18181b] group relative">
      <img
        src={imageSrc}
        alt="Real-Time Messaging Showcase"
        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        onError={(e) => {
          // Fallback if image path fails
          e.target.style.display = 'none';
        }}
      />
      {/* Live status badge overlay */}

    </div>
  );
}
