
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Piece {
  type: PieceType;
  color: Color;
}

export interface Square {
  rank: number; // 0-7
  file: number; // 0-7
}

export interface Move {
  from: string;
  to: string;
  promotion?: PieceType;
}

export interface Advice {
  bestMove: string; // Algebraic notation e.g. "e4"
  fromSquare: string; // e.g. "e2"
  toSquare: string; // e.g. "e4"
  explanation: string;
}

export interface AppState {
  fen: string;
  selectedSquare: string | null;
  validMoves: string[];
  opponentMoves: string[];
  opponentCaptures: string[];
  history: string[];
  lastMove: { from: string; to: string } | null;
  isGameOver: boolean;
  advice: Advice | null;
  isThinking: boolean;
  showOpponentThreats: boolean;
  playerColor: Color;
  autoHints: boolean;
  difficulty: Difficulty;
}
