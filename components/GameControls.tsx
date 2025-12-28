
import React from 'react';
import { Color, Difficulty } from '../types';

interface GameControlsProps {
  onReset: (color?: Color) => void;
  onUndo: () => void;
  canUndo: boolean;
  isGameOver: boolean;
  turn: 'w' | 'b';
  playerColor: Color;
  showThreats: boolean;
  onToggleThreats: () => void;
  autoHints: boolean;
  onToggleAutoHints: () => void;
  difficulty: Difficulty;
  onSetDifficulty: (d: Difficulty) => void;
  hideAutoHints?: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  onReset, 
  onUndo,
  canUndo,
  turn, 
  playerColor,
  showThreats, 
  onToggleThreats,
  autoHints,
  onToggleAutoHints,
  difficulty,
  onSetDifficulty,
  hideAutoHints = false
}) => {
  return (
    <div className="bg-white p-5 rounded-3xl shadow-lg border-4 border-orange-200 flex flex-col gap-3 items-center">
      <div className="flex flex-col items-center gap-1">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${turn === 'w' ? 'bg-white border-green-400' : 'bg-black border-gray-600'} transition-all`}>
          <span className="text-xl">{turn === playerColor ? '👶' : '🤖'}</span>
        </div>
        <span className="text-xl font-bold text-orange-600 text-center leading-tight">
          {turn === playerColor ? 'Det er DIN tur!' : 'Robotten tænker...'}
        </span>
      </div>

      <div className="flex flex-col w-full gap-2 mt-1">
        <div className="flex flex-col gap-1 mb-1">
          <label className="text-[10px] font-bold text-gray-500 text-center uppercase tracking-wider">Sværhedsgrad</label>
          <div className="flex gap-1 w-full">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button 
                key={d}
                onClick={() => onSetDifficulty(d)}
                className={`flex-1 py-1.5 text-xs rounded-xl font-bold transition-all border-2 
                  ${difficulty === d 
                    ? d === 'easy' ? 'bg-green-100 border-green-500 text-green-700' : d === 'medium' ? 'bg-yellow-100 border-yellow-500 text-yellow-700' : 'bg-red-100 border-red-500 text-red-700'
                    : 'bg-gray-50 border-gray-200 text-gray-400'}`}
              >
                {d === 'easy' ? 'Nem' : d === 'medium' ? 'Mellem' : 'Svær'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 w-full">
           <button 
            onClick={() => onReset('w')}
            className={`flex-1 py-2 text-sm rounded-xl font-bold transition-all border-2 ${playerColor === 'w' ? 'bg-white border-green-400 shadow-inner' : 'bg-gray-100 border-gray-200'}`}
          >
            ⚪ Spil Hvid
          </button>
          <button 
            onClick={() => onReset('b')}
            className={`flex-1 py-2 text-sm rounded-xl font-bold transition-all border-2 ${playerColor === 'b' ? 'bg-black text-white border-gray-600 shadow-inner' : 'bg-gray-100 border-gray-200'}`}
          >
            ⚫ Spil Sort
          </button>
        </div>

        <button 
          onClick={onUndo}
          disabled={!canUndo}
          className={`
            w-full py-3 px-4 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-lg
            ${canUndo ? 'bg-blue-400 hover:bg-blue-500 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
          `}
        >
          <span>🔙</span>
          <span>Fortryd</span>
        </button>

        {!hideAutoHints && (
            <button 
            onClick={onToggleAutoHints}
            className={`
                w-full py-2 px-4 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-sm
                ${autoHints ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' : 'bg-gray-100 text-gray-500 border-2 border-gray-300'}
            `}
            >
            <span>{autoHints ? '✨ Hurtig-hjælp: TIL' : '✨ Hurtig-hjælp: FRA'}</span>
            </button>
        )}

        <button 
          onClick={onToggleThreats}
          className={`
            w-full py-2 px-4 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-sm
            ${showThreats ? 'bg-red-100 text-red-600 border-2 border-red-300' : 'bg-gray-100 text-gray-500 border-2 border-gray-300'}
          `}
        >
          <span>{showThreats ? '🚩 Se farer: TIL' : '🚩 Se farer: FRA'}</span>
        </button>

        <button 
          onClick={() => onReset()}
          className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-lg mt-1"
        >
          <span>🔄</span>
          <span>Nyt spil</span>
        </button>
      </div>
    </div>
  );
};

export default GameControls;
