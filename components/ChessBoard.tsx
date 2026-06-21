
import React from 'react';
import { Chess, Square as ChessSquareType } from 'chess.js';
import { FILES, RANKS, PIECE_ICONS } from '../constants';
import { Advice } from '../types';

interface ChessBoardProps {
  fen: string;
  selectedSquare: string | null;
  validMoves: string[];
  opponentMoves: string[];
  opponentCaptures: string[];
  showOpponentThreats: boolean;
  onSquareClick: (square: string) => void;
  advice: Advice | null;
  lastMove: { from: string; to: string } | null;
  orientation: 'w' | 'b';
  hideLegend?: boolean;
  focusedSquare?: string | null;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ 
  fen, 
  selectedSquare, 
  validMoves, 
  opponentMoves,
  opponentCaptures,
  showOpponentThreats,
  onSquareClick,
  advice,
  lastMove,
  orientation,
  hideLegend = false,
  focusedSquare = null,
}) => {
  const game = new Chess(fen);
  const currentTurn = game.turn();

  const getPieceOnSquare = (square: string) => {
    return game.get(square as ChessSquareType);
  };

  const displayedRanks = orientation === 'w' ? RANKS : [...RANKS].reverse();
  const displayedFiles = orientation === 'w' ? FILES : [...FILES].reverse();

  return (
    <div className="relative p-2 bg-green-700 rounded-3xl shadow-2xl border-8 border-green-800">
      <div className="grid grid-cols-8 grid-rows-8 w-[280px] h-[280px] sm:w-[480px] sm:h-[480px] lg:w-[560px] lg:h-[560px] cursor-pointer touch-none select-none overflow-hidden rounded-xl bg-green-900 shadow-inner">
        {displayedRanks.map((rank, rIdx) => 
          displayedFiles.map((file, fIdx) => {
            const square = `${file}${rank}`;
            const piece = getPieceOnSquare(square);
            const isSelected = selectedSquare === square;
            const isValidMove = validMoves.includes(square);
            const isOpponentMove = opponentMoves.includes(square);
            const isOpponentCapture = opponentCaptures.includes(square);
            
            const isAdviceFrom = advice?.fromSquare === square;
            const isAdviceTo = advice?.toSquare === square;
            
            const isLastMoveFrom = lastMove?.from === square;
            const isLastMoveTo = lastMove?.to === square;
            const isFocused = focusedSquare === square;
            
            const isDark = (rIdx + fIdx) % 2 !== 0;

            return (
              <div 
                key={square}
                onClick={() => onSquareClick(square)}
                className={`
                  relative flex items-center justify-center 
                  ${isDark ? 'bg-[#96a33a]' : 'bg-[#e9edcc]'}
                  ${isSelected ? 'ring-4 ring-blue-400 z-30' : ''}
                  transition-all duration-200
                `}
              >
                {isLastMoveTo && (
                  <div className="absolute inset-0 bg-blue-500/50 z-0 ring-4 ring-blue-300 animate-pulse border-4 border-blue-400" />
                )}
                {isLastMoveFrom && (
                  <div className="absolute inset-0 bg-blue-200/40 z-0 border-4 border-dashed border-blue-500/60" />
                )}

                {isFocused && (
                  <div className="absolute inset-0 z-20 ring-4 ring-orange-400 ring-inset pointer-events-none" />
                )}

                {isAdviceTo && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="absolute inset-0 bg-yellow-400/60 animate-ping rounded-full m-1" />
                    <div className="absolute inset-0 bg-yellow-300/40 border-4 border-yellow-500 rounded-lg shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
                    <span className="text-3xl sm:text-5xl filter drop-shadow-lg z-20 animate-bounce">🎯</span>
                  </div>
                )}

                {isValidMove && (
                  <div className={`
                    absolute w-1/2 h-1/2 rounded-full z-10
                    ${piece ? 'ring-8 ring-green-400/70' : 'bg-green-400/60'}
                  `} />
                )}

                {showOpponentThreats && isOpponentMove && !isValidMove && !isSelected && !piece && (
                  <div className="absolute w-3 h-3 bg-red-500/30 rounded-full z-10" />
                )}

                {showOpponentThreats && isOpponentCapture && piece && piece.color === currentTurn && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-[92%] h-[92%] rounded-full border-4 border-red-600 animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.7)]" />
                  </div>
                )}

                {isAdviceFrom && (
                   <div className="absolute inset-0 border-4 border-yellow-500 z-10 pointer-events-none rounded-lg shadow-[0_0_25px_rgba(250,204,21,0.9)] bg-yellow-400/10" />
                )}

                {piece && (
                  <img 
                    src={PIECE_ICONS[`${piece.color}-${piece.type}`]} 
                    alt={`${piece.color} ${piece.type}`}
                    className={`
                      w-[88%] h-[88%] z-20 pointer-events-none
                      transition-transform active:scale-125
                      ${piece.color === 'w' ? 'filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]' : 'filter drop-shadow-[0_2px_3px_rgba(255,255,255,0.4)]'}
                      ${isAdviceFrom && piece.color === orientation && game.turn() === orientation ? 'animate-shake scale-110' : ''}
                    `}
                  />
                )}

                {fIdx === 0 && <span className={`absolute left-1 top-0.5 text-[8px] sm:text-[11px] font-bold ${isDark ? 'text-[#e9edcc]' : 'text-[#96a33a]'}`}>{rank}</span>}
                {rIdx === 7 && <span className={`absolute right-1 bottom-0.5 text-[8px] sm:text-[11px] font-bold ${isDark ? 'text-[#e9edcc]' : 'text-[#96a33a]'}`}>{file}</span>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChessBoard;
