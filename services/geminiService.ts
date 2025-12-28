
import { GoogleGenAI, Type } from "@google/genai";
import { Advice, Color } from "../types";

export async function getChessAdvice(fen: string, history: string[], playerColor: Color): Promise<Advice> {
  // Initialize GoogleGenAI inside the function to use the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const turnChar = fen.split(' ')[1];
    const actualTurn = turnChar === 'w' ? 'Hvid' : 'Sort';
    const playerSide = playerColor === 'w' ? 'Hvid' : 'Sort';

    if (turnChar !== playerColor) {
      return {
        bestMove: "",
        fromSquare: "",
        toSquare: "",
        explanation: `Det er ${actualTurn}s tur lige nu. Vent på din tur!`
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `DU ER EN SKAK-TRÆNER FOR ET BARN PÅ 4 ÅR.
      Barnet spiller som: ${playerSide}.
      Det er nu ${playerSide}s tur (bekræftet af FEN: ${fen}).
      
      Træk-historik: ${history.slice(-5).join(', ')}
      
      DIN OPGAVE:
      1. Find det ABSOLUT BEDSTE LOVLIGE TRÆK for ${playerSide}.
      2. Du MÅ KUN foreslå et træk for ${playerSide}.
      3. Giv en meget kort, glad og pædagogisk forklaring på dansk (maks 10 ord).
      
      VIGTIGT: Returner kun JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bestMove: { type: Type.STRING, description: "Notation f.eks. 'Nf3'" },
            fromSquare: { type: Type.STRING, description: "Startfelt f.eks. 'e2'" },
            toSquare: { type: Type.STRING, description: "Målfelt f.eks. 'e4'" },
            explanation: { type: Type.STRING, description: "Forklaring til barnet" },
          },
          required: ["bestMove", "fromSquare", "toSquare", "explanation"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return result as Advice;
  } catch (error) {
    console.error("Gemini advice error:", error);
    return {
      bestMove: "",
      fromSquare: "",
      toSquare: "",
      explanation: "Lad os kigge på brættet sammen!"
    };
  }
}

export async function getOpponentMove(fen: string, history: string[]): Promise<{ from: string, to: string } | null> {
  // Initialize GoogleGenAI inside the function to use the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Spil som en venlig men dygtig skakmodstander.
      FEN: ${fen}
      Historik: ${history.slice(-10).join(', ')}
      Find det bedste træk. Returner kun JSON med "from" og "to" felter.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            from: { type: Type.STRING },
            to: { type: Type.STRING },
          },
          required: ["from", "to"],
        },
      },
    });
    return JSON.parse(response.text);
  } catch (e) {
    return null;
  }
}
