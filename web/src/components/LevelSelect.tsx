import React from "react";
import { BackgroundTheme } from "../types";

interface LevelSelectProps {
  themes: BackgroundTheme[];
  selectedTheme: BackgroundTheme;
  onSelect: (theme: BackgroundTheme) => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({ themes, selectedTheme, onSelect }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-900 bg-opacity-75">
      <h2 className="text-4xl font-bold text-white">Select Background Theme</h2>
      <div className="grid grid-cols-3 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.name}
            className={`p-4 border-2 rounded-md ${
              theme === selectedTheme ? "border-yellow-400" : "border-gray-500"
            }`}
            onClick={() => onSelect(theme)}
          >
            <div
              className="w-12 h-12 rounded-full"
              style={{ background: theme.bg }}
            ></div>
            <p className="text-white mt-2">{theme.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};