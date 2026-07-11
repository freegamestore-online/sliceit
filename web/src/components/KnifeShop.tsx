import React from "react";
import { KnifeConfig } from "../types";

interface KnifeShopProps {
  knives: KnifeConfig[];
  selectedKnife: KnifeConfig;
  onSelect: (knife: KnifeConfig) => void;
}

export const KnifeShop: React.FC<KnifeShopProps> = ({ knives, selectedKnife, onSelect }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-900 bg-opacity-75">
      <h2 className="text-4xl font-bold text-white">Select Your Knife</h2>
      <div className="grid grid-cols-3 gap-4">
        {knives.map((knife) => (
          <button
            key={knife.name}
            className={`p-4 border-2 rounded-md ${
              knife === selectedKnife ? "border-yellow-400" : "border-gray-500"
            }`}
            onClick={() => onSelect(knife)}
          >
            <img src={knife.image} alt={knife.name} className="w-12 h-12" />
            <p className="text-white mt-2">{knife.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};