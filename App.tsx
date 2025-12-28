
import React, { useState, useCallback, useRef } from 'react';
import { Chess, Square as ChessSquareType, Move as ChessMove } from 'chess.js';
import ChessBoard from './components/ChessBoard';
import CoachPanel from './components/CoachPanel';
import GameControls from './components/GameControls';
import { INITIAL_FEN } from './constants';
import { AppState, Color, Difficulty } from './types';
import { getChessAdvice, getOpponentMove } from './services/geminiService';
import { speak } from './services/speechService';

const App: React.FC = () => {
  const gameRef = useRef(new Chess());
  const [state, setState] = useState<AppState>({
    fen: INITIAL_FEN,
    selectedSquare: null,
    validMoves: [],
    opponentMoves: [],
    opponentCaptures: [],
    history: [],
    lastMove: null,
    isGameOver: false,
    advice: null,
    isThinking: false,
    showOpponentThreats: true,
    playerColor: 'w',
    autoHints: false,
    difficulty: 'easy',
  });

  const calculateThreats = useCallback((fen: string) => {
    const fenParts = fen.split(' ');
    const opponentColor = fenParts[1] === 'w' ? 'b' : 'w';
    const tempParts = [...fenParts];
    tempParts[1] = opponentColor;
    const opponentGame = new Chess(tempParts.join(' '));
    const allMoves = opponentGame.moves({ verbose: true });
    const captures = allMoves
      .filter(m => m.flags.includes('c') || m.flags.includes('e'))
      .map(m => m.to);
    const moves = allMoves.map(m => m.to);
    return { 
      moves: Array.from(new Set(moves)), 
      captures: Array.from(new Set(captures)) 
    };
  }, []);

  const updateStateAfterMove = useCallback((moveDetails?: { from: string, to: string }) => {
    const game = gameRef.current;
    const fen = game.fen();
    const threats = calculateThreats(fen);
    
    setState(prev => ({
      ...prev,
      fen,
      history: game.history(),
      isGameOver: game.isGameOver(),
      opponentMoves: threats.moves,
      opponentCaptures: threats.captures,
      selectedSquare: null,
      validMoves: [],
      lastMove: moveDetails || prev.lastMove,
      advice: null, // Ryd altid hjælp når der er flyttet
    }));
  }, [calculateThreats]);

  const makeAIMove = useCallback(async () => {
    const game = gameRef.current;
    if (game.isGameOver()) return;
    
    const possibleMoves = game.moves({ verbose: true });
    if (possibleMoves.length === 0) return;

    let move: ChessMove | null = null;

    if (state.difficulty === 'easy') {
      move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      game.move(move);
    } else if (state.difficulty === 'medium') {
      const captures = possibleMoves.filter(m => m.flags.includes('c'));
      move = captures.length > 0 
        ? captures[Math.floor(Math.random() * captures.length)]
        : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      game.move(move);
    } else {
      const moveSuggestion = await getOpponentMove(game.fen(), game.history());
      if (moveSuggestion) {
        try {
          move = game.move({ from: moveSuggestion.from, to: moveSuggestion.to, promotion: 'q' });
        } catch (e) {
          move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
          game.move(move);
        }
      } else {
        move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        game.move(move);
      }
    }

    if (move) {
      updateStateAfterMove({ from: move.from, to: move.to });
    }
  }, [updateStateAfterMove, state.difficulty]);

  const onSquareClick = (square: string) => {
    const game = gameRef.current;
    if (state.isGameOver) return;
    
    const currentTurn = game.turn();
    if (currentTurn !== state.playerColor) return;

    // Ryd hjælp så snart man rører ved brættet
    if (state.advice) {
        setState(prev => ({ ...prev, advice: null }));
    }

    if (state.selectedSquare) {
      try {
        const move = game.move({
          from: state.selectedSquare,
          to: square,
          promotion: 'q',
        });

        if (move) {
          updateStateAfterMove({ from: move.from, to: move.to });
          if (!game.isGameOver()) {
            setTimeout(makeAIMove, 1800);
          }
          return;
        }
      } catch (e) {}
    }

    const piece = game.get(square as ChessSquareType);
    if (piece && piece.color === currentTurn) {
      const moves = game.moves({ square: square as ChessSquareType, verbose: true });
      setState(prev => ({
        ...prev,
        selectedSquare: square,
        validMoves: moves.map(m => m.to),
      }));
    } else {
      setState(prev => ({
        ...prev,
        selectedSquare: null,
        validMoves: [],
      }));
    }
  };

  const handleGetAdvice = async () => {
    const game = gameRef.current;
    const currentFen = game.fen();
    if (state.isThinking || game.turn() !== state.playerColor) return;
    
    setState(prev => ({ ...prev, isThinking: true }));
    const advice = await getChessAdvice(currentFen, game.history(), state.playerColor);
    
    // Vigtigt: Tjek om brættet har ændret sig mens AI'en tænkte
    if (gameRef.current.fen() === currentFen) {
        setState(prev => ({ ...prev, advice, isThinking: false }));
    } else {
        setState(prev => ({ ...prev, isThinking: false, advice: null }));
    }
  };

  const handleReset = (newColor?: Color) => {
    const color = newColor || state.playerColor;
    const newGame = new Chess();
    gameRef.current = newGame;
    const threats = calculateThreats(INITIAL_FEN);
    
    setState(prev => ({
      ...prev,
      fen: INITIAL_FEN,
      selectedSquare: null,
      validMoves: [],
      opponentMoves: threats.moves,
      opponentCaptures: threats.captures,
      history: [],
      lastMove: null,
      isGameOver: false,
      advice: null,
      isThinking: false,
      playerColor: color,
    }));

    if (color === 'b') {
      setTimeout(makeAIMove, 1000);
    }
  };

  const handleUndo = () => {
    const game = gameRef.current;
    game.undo();
    game.undo();
    setState(prev => ({
      ...prev,
      selectedSquare: null,
      validMoves: [],
      advice: null,
    }));
    updateStateAfterMove();
  };

  const handleSetDifficulty = (difficulty: Difficulty) => {
    setState(prev => ({ ...prev, difficulty }));
  };

  const toggleThreats = () => setState(prev => ({ ...prev, showOpponentThreats: !prev.showOpponentThreats }));

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center gap-6 overflow-x-hidden">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-green-600 mb-2 drop-shadow-sm select-none">
          🌟 Min Første Skak 🌟
        </h1>
        <p className="text-green-800 text-lg">Hav det sjovt med at spille skak!</p>
      </header>

      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Venstre side */}
        <div className="md:col-span-3 order-2 md:order-1 flex flex-col gap-4">
          <GameControls 
            onReset={handleReset} 
            onUndo={handleUndo}
            canUndo={gameRef.current.history().length >= 2}
            isGameOver={state.isGameOver} 
            turn={gameRef.current.turn()}
            playerColor={state.playerColor}
            showThreats={state.showOpponentThreats}
            onToggleThreats={toggleThreats}
            autoHints={false}
            onToggleAutoHints={() => {}}
            difficulty={state.difficulty}
            onSetDifficulty={handleSetDifficulty}
            hideAutoHints={true}
          />
          
          <div className="bg-white p-5 rounded-3xl shadow-md border-2 border-green-100 hidden md:flex flex-col gap-4">
            <h4 className="font-bold text-green-700 border-b border-green-100 pb-2">Hvad betyder farverne?</h4>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-400 rounded-full shadow-sm"></div> 
              <span className="text-sm font-bold text-gray-600">Her kan du flytte hen</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-red-500 rounded-full bg-red-900/40"></div> 
              <span className="text-sm font-bold text-gray-600">Pas på! Robotten kan tage dig her</span>
            </div>
          </div>
        </div>

        {/* Midten */}
        <div className="md:col-span-6 order-1 md:order-2 flex flex-col items-center gap-4">
          <ChessBoard 
            fen={state.fen} 
            selectedSquare={state.selectedSquare}
            validMoves={state.validMoves}
            opponentMoves={state.opponentMoves}
            opponentCaptures={state.opponentCaptures}
            showOpponentThreats={state.showOpponentThreats}
            onSquareClick={onSquareClick}
            advice={state.advice}
            lastMove={state.lastMove}
            orientation={state.playerColor}
            hideLegend={true}
          />
        </div>

        {/* Højre side - CoachPanel (Ugle hjælpen) */}
        <div className="md:col-span-3 order-3 flex flex-col gap-4">
          <CoachPanel 
            advice={state.advice}
            isThinking={state.isThinking}
            onGetAdvice={handleGetAdvice}
          />
          
          <div className="bg-white p-5 rounded-3xl shadow-md border-2 border-blue-100 hidden md:flex flex-col gap-4">
            <h4 className="font-bold text-blue-700 border-b border-blue-100 pb-2">Hvad siger Uglen?</h4>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-yellow-400 rounded-md border border-yellow-600 shadow-sm"></div> 
              <span className="text-sm font-bold text-gray-600">Flyt denne brik</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <span className="text-sm font-bold text-gray-600">Sæt brikken her</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 border-2 border-blue-300 rounded-md shadow-sm"></div> 
              <span className="text-sm font-bold text-gray-600">Det sidste robotten gjorde</span>
            </div>
          </div>
        </div>
      </div>

      {state.isGameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl text-center shadow-2xl transform animate-bounce border-8 border-yellow-400">
            <h2 className="text-5xl font-bold text-yellow-500 mb-4">Wauw! 🎉</h2>
            <p className="text-2xl text-gray-700 mb-6">Det var super godt spillet!</p>
            <button 
              onClick={() => handleReset()}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-10 rounded-full text-2xl transition-all shadow-lg active:scale-95"
            >
              Spil Igen!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
