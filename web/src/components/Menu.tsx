import React from "react";

interface MenuProps {
  onStart: () => void;
  onCustomize: () => void;
  bestScore: number;
}

export const Menu: React.FC<MenuProps> = ({ onStart, onCustomize, bestScore }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-pink-500">SLICEit</h1>
      {bestScore > 0 && <p className="text-white">Best Score: {bestScore}</p>}
      <button
        onClick={onStart}
        className="bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600 transition"
      >
        Start Game
      </button>
      <button
        onClick={onCustomize}
        className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition"
      >
        Customize
      </button>
    </div>
  );
};