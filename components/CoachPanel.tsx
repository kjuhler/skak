
import React, { useState } from 'react';
import { Advice } from '../types';
import { speak } from '../services/speechService';

interface CoachPanelProps {
  advice: Advice | null;
  isThinking: boolean;
  onGetAdvice: () => void;
}

const CoachPanel: React.FC<CoachPanelProps> = ({ advice, isThinking, onGetAdvice }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = async () => {
    if (!advice) return;
    setIsPlaying(true);
    await speak(advice.explanation);
    setIsPlaying(false);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-blue-200 flex flex-col items-center text-center">
      <div className="relative mb-4">
        <div className={`w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center border-4 border-blue-300 transition-transform ${isPlaying ? 'scale-110' : ''}`}>
           <span className={`text-5xl ${isPlaying ? 'animate-bounce' : ''}`}>🦉</span>
        </div>
        {isThinking && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 animate-spin">
            <span className="text-sm">⚙️</span>
          </div>
        )}
      </div>

      <h3 className="text-2xl font-bold text-blue-600 mb-2">Skak-Uglen Ulla</h3>
      
      <div className="min-h-[120px] flex flex-col items-center justify-center">
        {isThinking ? (
          <p className="text-blue-400 italic animate-pulse text-lg">Uglen tænker...</p>
        ) : advice ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center">
             <div className="bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full font-bold text-sm mb-2 shadow-sm">
              Tip: Flyt {advice.bestMove}!
            </div>
            <p className="text-gray-700 bg-blue-50 p-4 rounded-2xl italic mb-3 text-lg border-2 border-blue-100 leading-tight">
              "{advice.explanation}"
            </p>
            <button 
              onClick={handlePlayAudio}
              className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-5 py-2.5 rounded-full font-bold transition-all active:scale-95 shadow-sm"
            >
              <span className="text-xl">🔈</span>
              <span>Hør det igen</span>
            </button>
          </div>
        ) : (
          <p className="text-gray-400 italic text-lg">Jeg holder øje med brikkerne for dig!</p>
        )}
      </div>

      <button 
        onClick={onGetAdvice}
        disabled={isThinking}
        className={`
          mt-6 w-full py-5 px-6 rounded-3xl font-bold text-white transition-all text-2xl
          ${isThinking ? 'bg-gray-300 cursor-not-allowed opacity-50' : 'bg-blue-500 hover:bg-blue-600 active:scale-95 shadow-lg flex flex-col items-center gap-1'}
        `}
      >
        <span className="text-4xl">💡</span>
        <span>Hjælp mig nu</span>
      </button>
    </div>
  );
};

export default CoachPanel;
