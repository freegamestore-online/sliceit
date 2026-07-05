import { useRef, useState } from "react";
import { GameShell, GameTopbar } from "@freegamestore/games";
import { Game } from "./components/Game";
import { useHighScore } from "./hooks/useHighScore";
import { ROUND_SECONDS, KNIFE_CONFIGS, BG_THEMES } from "./lib/logic";
import type { GamePhase, KnifeConfig, BackgroundTheme } from "./types";

export default function App() {
  const [phase, setPhase] = useState<GamePhase>("menu");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [round, setRound] = useState(0);
  const [highScore, setHighScore] = useHighScore("sliceit-highscore");
  const [selectedKnife, setSelectedKnife] = useState<KnifeConfig>(KNIFE_CONFIGS[0]!);
  const [selectedTheme, setSelectedTheme] = useState<BackgroundTheme>(BG_THEMES[0]!);
  const [showCustomize, setShowCustomize] = useState(false);

  const scoreRef = useRef(0);

  const handleScore = (s: number) => {
    scoreRef.current = s;
    setScore(s);
  };

  const start = () => {
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setRound(r => r + 1);
    setPhase("playing");
    setShowCustomize(false);
  };

  const end = () => {
    setHighScore(scoreRef.current);
    setPhase("over");
  };

  const allTimeHighScore = Math.max(highScore, scoreRef.current);

  return (
    <GameShell
      topbar={
        <GameTopbar
          title="SLICEit 🔪"
          stats={[
            { label: "Score", value: score, accent: true },
            { label: "Time", value: `${timeLeft}s` },
            { label: "Best", value: allTimeHighScore },
          ]}
        />
      }
    >
      <div className="relative w-full h-full overflow-hidden" style={{ background: selectedTheme.bg }}>

        {/* PLAYING */}
        {phase === "playing" && (
          <Game
            key={round}
            onScore={handleScore}
            onTime={setTimeLeft}
            onGameOver={end}
            knife={selectedKnife}
            theme={selectedTheme}
          />
        )}

        {/* MENU */}
        {phase === "menu" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4">
            {/* Floating background emojis */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
              {["🍉", "🍓", "🍩", "🍰", "🍭", "🥝", "🍊", "🍌"].map((e, i) => (
                <span
                  key={i}
                  className="absolute text-4xl opacity-15"
                  style={{
                    left: `${(i * 13.7 + 5) % 90}%`,
                    top: `${(i * 17.3 + 8) % 85}%`,
                    animation: `float${i % 3} ${3 + i * 0.4}s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                >
                  {e}
                </span>
              ))}
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm">
              {/* Title */}
              <div className="text-center">
                <h1
                  className="text-6xl font-black tracking-tight"
                  style={{ fontFamily: "Fraunces, serif", color: "#ff6b8a" }}
                >
                  SLICE<span style={{ color: "#c77dff" }}>it</span>
                </h1>
                <p className="text-lg mt-1" style={{ color: "#a07090", fontFamily: "Manrope, sans-serif" }}>
                  Swipe to slice the fruits! 🍓
                </p>
              </div>

              {/* High score */}
              {allTimeHighScore > 0 && (
                <div
                  className="px-6 py-2 rounded-full text-sm font-semibold"
                  style={{ background: "rgba(255,107,138,0.15)", color: "#ff6b8a", fontFamily: "Manrope, sans-serif" }}
                >
                  🏆 Best: {allTimeHighScore} pts
                </div>
              )}

              {/* Play button */}
              <button
                onClick={start}
                className="w-full py-4 rounded-2xl text-white text-xl font-bold shadow-lg active:scale-95 transition-transform"
                style={{
                  background: "linear-gradient(135deg, #ff6b8a, #c77dff)",
                  fontFamily: "Manrope, sans-serif",
                  minHeight: 56,
                }}
              >
                🔪 Start Slicing!
              </button>

              {/* Customize button */}
              <button
                onClick={() => setShowCustomize(true)}
                className="w-full py-3 rounded-2xl text-lg font-semibold active:scale-95 transition-transform"
                style={{
                  background: "rgba(199,125,255,0.15)",
                  color: "#c77dff",
                  border: "2px solid rgba(199,125,255,0.3)",
                  fontFamily: "Manrope, sans-serif",
                  minHeight: 52,
                }}
              >
                ✨ Customize Knife & Theme
              </button>

              {/* Current selection preview */}
              <div className="flex gap-3 items-center text-sm" style={{ color: "#a07090", fontFamily: "Manrope, sans-serif" }}>
                <span>{selectedKnife.emoji} {selectedKnife.name}</span>
                <span>·</span>
                <span>🎨 {selectedTheme.name}</span>
              </div>
            </div>
          </div>
        )}

        {/* GAME OVER */}
        {phase === "over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4">
            <div className="relative z-10 flex flex-col items-center gap-5 w-full max-w-sm">
              <div className="text-center">
                <div className="text-5xl mb-2">🍉</div>
                <h2
                  className="text-4xl font-black"
                  style={{ fontFamily: "Fraunces, serif", color: "#ff6b8a" }}
                >
                  Time's Up!
                </h2>
              </div>

              {/* Score card */}
              <div
                className="w-full rounded-2xl p-5 text-center"
                style={{ background: "rgba(255,255,255,0.7)", border: "2px solid rgba(255,107,138,0.2)" }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: "#a07090", fontFamily: "Manrope, sans-serif" }}>
                  YOUR SCORE
                </p>
                <p
                  className="text-5xl font-black"
                  style={{ fontFamily: "Fraunces, serif", color: "#ff6b8a" }}
                >
                  {scoreRef.current}
                </p>
                {scoreRef.current >= allTimeHighScore && scoreRef.current > 0 && (
                  <p className="text-sm font-semibold mt-2" style={{ color: "#c77dff", fontFamily: "Manrope, sans-serif" }}>
                    🎉 New High Score!
                  </p>
                )}
                {allTimeHighScore > 0 && (
                  <p className="text-sm mt-1" style={{ color: "#a07090", fontFamily: "Manrope, sans-serif" }}>
                    Best: {allTimeHighScore} pts
                  </p>
                )}
              </div>

              {/* Unlocked knives hint */}
              {(() => {
                const nextKnife = KNIFE_CONFIGS.find(k => k.unlockScore > (allTimeHighScore));
                return nextKnife ? (
                  <p className="text-sm text-center" style={{ color: "#a07090", fontFamily: "Manrope, sans-serif" }}>
                    {nextKnife.emoji} Unlock <strong>{nextKnife.name}</strong> knife at {nextKnife.unlockScore} pts!
                  </p>
                ) : null;
              })()}

              <button
                onClick={start}
                className="w-full py-4 rounded-2xl text-white text-xl font-bold shadow-lg active:scale-95 transition-transform"
                style={{
                  background: "linear-gradient(135deg, #ff6b8a, #c77dff)",
                  fontFamily: "Manrope, sans-serif",
                  minHeight: 56,
                }}
              >
                🔪 Play Again
              </button>

              <button
                onClick={() => setPhase("menu")}
                className="w-full py-3 rounded-2xl text-lg font-semibold active:scale-95 transition-transform"
                style={{
                  background: "rgba(199,125,255,0.15)",
                  color: "#c77dff",
                  border: "2px solid rgba(199,125,255,0.3)",
                  fontFamily: "Manrope, sans-serif",
                  minHeight: 52,
                }}
              >
                🏠 Menu
              </button>
            </div>
          </div>
        )}

        {/* CUSTOMIZE MODAL */}
        {showCustomize && (
          <div
            className="absolute inset-0 flex items-end sm:items-center justify-center z-50"
            style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
            onClick={e => { if (e.target === e.currentTarget) setShowCustomize(false); }}
          >
            <div
              className="w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
              style={{ background: "#fff0f6", border: "2px solid rgba(255,107,138,0.2)" }}
            >
              <div className="flex items-center justify-between">
                <h3
                  className="text-2xl font-black"
                  style={{ fontFamily: "Fraunces, serif", color: "#ff6b8a" }}
                >
                  Customize ✨
                </h3>
                <button
                  onClick={() => setShowCustomize(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl active:scale-90 transition-transform"
                  style={{ background: "rgba(255,107,138,0.15)", color: "#ff6b8a" }}
                >
                  ✕
                </button>
              </div>

              {/* Knife selection */}
              <div>
                <p className="text-sm font-bold mb-3" style={{ color: "#a07090", fontFamily: "Manrope, sans-serif" }}>
                  🔪 CHOOSE KNIFE
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {KNIFE_CONFIGS.map(k => {
                    const locked = k.unlockScore > allTimeHighScore;
                    const active = selectedKnife.id === k.id;
                    return (
                      <button
                        key={k.id}
                        onClick={() => { if (!locked) setSelectedKnife(k); }}
                        disabled={locked}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all active:scale-95"
                        style={{
                          background: active
                            ? "linear-gradient(135deg, rgba(255,107,138,0.2), rgba(199,125,255,0.2))"
                            : "rgba(255,255,255,0.6)",
                          border: active
                            ? "2px solid rgba(255,107,138,0.5)"
                            : "2px solid rgba(255,107,138,0.1)",
                          opacity: locked ? 0.5 : 1,
                          minHeight: 52,
                        }}
                      >
                        <span className="text-2xl">{k.emoji}</span>
                        <div className="flex-1">
                          <p className="font-bold text-sm" style={{ color: "#ff6b8a", fontFamily: "Manrope, sans-serif" }}>
                            {k.name}
                          </p>
                          {locked && (
                            <p className="text-xs" style={{ color: "#a07090", fontFamily: "Manrope, sans-serif" }}>
                              🔒 Unlock at {k.unlockScore} pts
                            </p>
                          )}
                        </div>
                        {/* Blade preview */}
                        <div
                          className="w-3 h-8 rounded-full"
                          style={{ background: k.bladeColor, border: "1px solid rgba(0,0,0,0.1)" }}
                        />
                        <div
                          className="w-3 h-5 rounded-sm"
                          style={{ background: k.handleColor, border: "1px solid rgba(0,0,0,0.1)" }}
                        />
                        {active && <span className="text-lg">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Theme selection */}
              <div>
                <p className="text-sm font-bold mb-3" style={{ color: "#a07090", fontFamily: "Manrope, sans-serif" }}>
                  🎨 CHOOSE BACKGROUND
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {BG_THEMES.map(t => {
                    const locked = t.unlockScore > allTimeHighScore;
                    const active = selectedTheme.id === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => { if (!locked) setSelectedTheme(t); }}
                        disabled={locked}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all active:scale-95"
                        style={{
                          background: t.bg,
                          border: active
                            ? "2px solid rgba(255,107,138,0.6)"
                            : "2px solid rgba(255,107,138,0.15)",
                          opacity: locked ? 0.5 : 1,
                          minHeight: 52,
                        }}
                      >
                        <div className="flex gap-1">
                          {t.stripes.map((c, i) => (
                            <div key={i} className="w-5 h-5 rounded-full" style={{ background: c }} />
                          ))}
                        </div>
                        <p className="text-xs font-bold" style={{ color: "#a07090", fontFamily: "Manrope, sans-serif" }}>
                          {t.name}
                        </p>
                        {locked && (
                          <p className="text-xs" style={{ color: "#c77dff", fontFamily: "Manrope, sans-serif" }}>
                            🔒 {t.unlockScore}pts
                          </p>
                        )}
                        {active && <span className="text-sm">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setShowCustomize(false)}
                className="w-full py-4 rounded-2xl text-white text-lg font-bold active:scale-95 transition-transform"
                style={{
                  background: "linear-gradient(135deg, #ff6b8a, #c77dff)",
                  fontFamily: "Manrope, sans-serif",
                  minHeight: 56,
                }}
              >
                Done ✓
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes float0 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </GameShell>
  );
}
