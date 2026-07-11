import React from "react";
import { useHighScore } from "../hooks/useHighScore";

interface HUDProps {
  score: number;
  timeLeft: number;
  highScoreKey: string;
}

export const HUD: React.FC<HUDProps> = ({ score, timeLeft, highScoreKey }) => {
  const [highScore] = useHighScore(highScoreKey);

  return (
    <div className="absolute top-4 left-4 text-white">
      <div className="mb-2">Score: {score}</div>
      <div className="mb-2">Time Left: {timeLeft}s</div>
      <div className="mb-2">High Score: {highScore}</div>
    </div>
  );
};