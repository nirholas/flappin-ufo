import { describe, expect, it } from "vitest";
import { gameReducer, initialState, type GameState } from "./state";

const playing: GameState = { ...initialState, phase: "playing", level: 1 };

describe("gameReducer", () => {
  it("starts on the title screen", () => {
    expect(initialState.phase).toBe("title");
  });

  it("dismisses title to idle", () => {
    const next = gameReducer(initialState, { type: "DISMISS_TITLE" });
    expect(next.phase).toBe("idle");
  });

  it("ignores DISMISS_TITLE from non-title phases", () => {
    const next = gameReducer(playing, { type: "DISMISS_TITLE" });
    expect(next).toBe(playing);
  });

  it("starts play from idle", () => {
    const idle = gameReducer(initialState, { type: "DISMISS_TITLE" });
    const next = gameReducer(idle, { type: "START_PLAY" });
    expect(next.phase).toBe("playing");
    expect(next.levelScore).toBe(0);
    expect(next.playerUp).toBe(false);
  });

  it("toggles playerUp via input only while playing", () => {
    expect(gameReducer(playing, { type: "INPUT_UP" }).playerUp).toBe(true);
    expect(
      gameReducer({ ...playing, playerUp: true }, { type: "INPUT_DOWN" })
        .playerUp,
    ).toBe(false);
    // Ignored outside playing
    const idle: GameState = { ...initialState, phase: "idle" };
    expect(gameReducer(idle, { type: "INPUT_UP" })).toBe(idle);
  });

  it("crashes from playing and finalizes after the timeout transition", () => {
    const crashed = gameReducer(playing, { type: "CRASH" });
    expect(crashed.phase).toBe("crashing");
    expect(crashed.playerUp).toBe(false);
    const over = gameReducer(crashed, { type: "FINALIZE_CRASH" });
    expect(over.phase).toBe("gameOver");
  });

  it("increments gameScore on score advances", () => {
    const next = gameReducer(playing, {
      type: "SET_LEVEL_SCORE",
      score: 1,
      threshold: 7,
    });
    expect(next.levelScore).toBe(1);
    expect(next.gameScore).toBe(1);
  });

  it("transitions to levelEnding when score hits threshold", () => {
    const next = gameReducer(playing, {
      type: "SET_LEVEL_SCORE",
      score: 7,
      threshold: 7,
    });
    expect(next.phase).toBe("levelEnding");
    expect(next.playerUp).toBe(true);
  });

  it("walks through the level transition and advances level", () => {
    const ending: GameState = { ...playing, phase: "levelEnding" };
    const transition = gameReducer(ending, { type: "FINALIZE_LEVEL_END" });
    expect(transition.phase).toBe("levelTransition");
    const next = gameReducer(transition, { type: "ADVANCE_LEVEL" });
    expect(next.phase).toBe("idle");
    expect(next.level).toBe(2);
    expect(next.levelScore).toBe(0);
    expect(next.playerUp).toBe(false);
  });

  it("restart from gameOver returns to idle at level 1", () => {
    const over: GameState = {
      phase: "gameOver",
      level: 4,
      levelScore: 3,
      gameScore: 17,
      playerUp: true,
    };
    const restarted = gameReducer(over, { type: "RESTART" });
    expect(restarted).toEqual({ ...initialState, phase: "idle" });
  });

  it("ignores actions in invalid phases (no-op identity)", () => {
    expect(gameReducer(initialState, { type: "INPUT_UP" })).toBe(initialState);
    expect(gameReducer(initialState, { type: "CRASH" })).toBe(initialState);
    expect(gameReducer(initialState, { type: "ADVANCE_LEVEL" })).toBe(
      initialState,
    );
  });
});
