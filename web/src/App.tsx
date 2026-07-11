import { useState } from "react";
import { GameShell, GameTopbar } from "@freegamestore/games";
import Menu from "./components/Menu";
import LevelSelect from "./components/LevelSelect";
import Game from "./components/Game";
import HUD from "./components/HUD";
import KnifeShop from "./components/KnifeShop";
import { useHighScore } from "./hooks/useHighScore";

export default function App() {
  const [phase, setPhase] = useState("menu"); // "menu", "level-select", "playing", "shop"
  const [coins, setCoins] = useState(0);
  const [highScore, setHighScore] = useHighScore("sliceit-highscore");
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedKnife, setSelectedKnife] = useState<string>("default");

  const handleGameEnd = (score: number, earnedCoins: number) => {
    setCoins((prev) => prev + earnedCoins);
    if (score > highScore) setHighScore(score);
    setPhase("menu");
  };

  return (
    <GameShell
      topbar={<GameTopbar title="SLICEit 🔪" />}
    >
      {phase === "menu" && (
        <Menu
          coins={coins}
          highScore={highScore}
          onPlay={() => setPhase("level-select")}
          onShop={() => setPhase("shop")}
        />
      )}

      {phase === "level-select" && (
        <LevelSelect
          onLevelSelect={(level) => {
            setSelectedLevel(level);
            setPhase("playing");
          }}
          onBack={() => setPhase("menu")}
        />
      )}

      {phase === "playing" && selectedLevel !== null && (
        <>
          <HUD coins={coins} knife={selectedKnife} />
          <Game
            level={selectedLevel}
            knife={selectedKnife}
            onGameEnd={handleGameEnd}
          />
        </>
      )}

      {phase === "shop" && (
        <KnifeShop
          coins={coins}
          selectedKnife={selectedKnife}
          onKnifeSelect={setSelectedKnife}
          onBack={() => setPhase("menu")}
        />
      )}
    </GameShell>
  );
}