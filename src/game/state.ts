export type Phase =
  | "title"
  | "idle"
  | "playing"
  | "crashing"
  | "levelEnding"
  | "levelTransition"
  | "gameOver";

export type GameState = {
  phase: Phase;
  level: number;
  levelScore: number;
  gameScore: number;
  playerUp: boolean;
};

export type Action =
  | { type: "DISMISS_TITLE" }
  | { type: "START_PLAY" }
  | { type: "INPUT_UP" }
  | { type: "INPUT_DOWN" }
  | { type: "SET_LEVEL_SCORE"; score: number; threshold: number }
  | { type: "CRASH" }
  | { type: "FINALIZE_CRASH" }
  | { type: "FINALIZE_LEVEL_END" }
  | { type: "ADVANCE_LEVEL" }
  | { type: "RESTART" };

export const initialState: GameState = {
  phase: "title",
  level: 1,
  levelScore: 0,
  gameScore: 0,
  playerUp: false,
};

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "DISMISS_TITLE":
      if (state.phase !== "title") return state;
      return { ...state, phase: "idle" };

    case "START_PLAY":
      if (state.phase !== "idle") return state;
      return { ...state, phase: "playing", levelScore: 0, playerUp: false };

    case "INPUT_UP":
      if (state.phase !== "playing") return state;
      return { ...state, playerUp: true };

    case "INPUT_DOWN":
      if (state.phase !== "playing") return state;
      return { ...state, playerUp: false };

    case "SET_LEVEL_SCORE": {
      if (state.phase !== "playing") return state;
      if (action.score === state.levelScore) return state;
      const advanced = action.score > state.levelScore;
      const reachedEnd = action.score >= action.threshold;
      return {
        ...state,
        levelScore: action.score,
        gameScore: advanced ? state.gameScore + 1 : state.gameScore,
        ...(reachedEnd ? { phase: "levelEnding" as const, playerUp: true } : {}),
      };
    }

    case "CRASH":
      if (state.phase !== "playing") return state;
      return { ...state, phase: "crashing", playerUp: false };

    case "FINALIZE_CRASH":
      if (state.phase !== "crashing") return state;
      return { ...state, phase: "gameOver" };

    case "FINALIZE_LEVEL_END":
      if (state.phase !== "levelEnding") return state;
      return { ...state, phase: "levelTransition" };

    case "ADVANCE_LEVEL":
      if (state.phase !== "levelTransition") return state;
      return {
        ...state,
        phase: "idle",
        level: state.level + 1,
        levelScore: 0,
        playerUp: false,
      };

    case "RESTART":
      if (state.phase !== "gameOver") return state;
      return { ...initialState, phase: "idle" };
  }
}

export const isScrolling = (phase: Phase) =>
  phase === "playing" ||
  phase === "crashing" ||
  phase === "levelEnding" ||
  phase === "levelTransition";

export const showFlame = (phase: Phase) =>
  phase === "playing" || phase === "crashing" || phase === "levelEnding";

export const isEndOfLevel = (phase: Phase) =>
  phase === "levelEnding" || phase === "levelTransition";
