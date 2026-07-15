import React from "react";

export default function HeroSection() {
  const orbitDetails = [
    { radius: 20, items: [{ text: "1", angle: 0 }, { text: "0", angle: 180 }] },
    { radius: 36, items: [{ text: "</>", angle: 45 }, { text: "fn", angle: 225 }] },
    { radius: 52, items: [{ text: "{ }", angle: 90 }, { text: "git", angle: 270 }] },
    { radius: 68, items: [{ text: "src", angle: 150 }, { text: "npm", angle: 330 }] },
    { radius: 84, items: [{ text: "const", angle: 30 }, { text: "api", angle: 210 }] },
    { radius: 100, items: [{ text: "[ ]", angle: 120 }, { text: "db", angle: 300 }] },
    { radius: 116, items: [{ text: "1", angle: 60 }, { text: "0", angle: 240 }, { text: "cmd", angle: 150 }] },
    { radius: 132, items: [{ text: "ssh", angle: 0 }, { text: "ssl", angle: 180 }, { text: "web", angle: 270 }] },
    { radius: 148, items: [{ text: "code", angle: 90 }, { text: "dev", angle: 270 }, { text: "#", angle: 180 }] },
  ];

  return (
    <section 
      className="relative rounded-3xl border border-zinc-800 p-6 md:p-10 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
      style={{
        background: "linear-gradient(135deg, rgba(20, 20, 23, 0.9) 0%, rgba(9, 9, 11, 0.95) 100%)",
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.7)"
      }}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-[#00ff66]/20 via-transparent to-transparent pointer-events-none z-0" />
      
      {/* Google Antigravity-inspired moving particle vortex swirl */}
      <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-[300px] md:w-[460px] h-[300px] md:h-[460px] z-0 pointer-events-none select-none opacity-60">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 200">
          <defs>
            <radialGradient id="neonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00ff66" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          <circle cx="100" cy="100" r="70" fill="url(#neonGlow)" />

          {orbitDetails.map((orbit, idx) => {
            const radius = orbit.radius;
            const dashArray = `${2 + idx} ${6 + idx * 2}`;
            const animDuration = `${30 + idx * 12}s`;

            return (
              <g 
                key={idx}
                className="animate-spin origin-center text-emerald-500"
                style={{
                  animationDuration: animDuration,
                }}
              >
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeDasharray={dashArray}
                  strokeOpacity={0.6 - idx * 0.05}
                  fill="none"
                />
                {orbit.items.map((item, itemIdx) => (
                  <text
                    key={itemIdx}
                    x="100"
                    y={100 - radius}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="currentColor"
                    className="font-mono text-[5.5px] font-extrabold opacity-75 select-none"
                    style={{
                      transform: `rotate(${item.angle}deg)`,
                      transformOrigin: "100px 100px",
                    }}
                  >
                    {item.text}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex-1 space-y-3.5 z-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-50 tracking-tight leading-tight">
          Network
        </h1>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-md">
          Discover developers building amazing products. <br className="hidden sm:inline" />
          Connect, collaborate, and learn together.
        </p>
      </div>
    </section>
  );
}
