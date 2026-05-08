import {
  createRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type RefObject,
} from "react";
import cx from "classnames";
import { useRequestAnimationFrame } from "./useRequestAnimationFrame";
import {
  DIST_BETWEEN_PILLARS,
  generatePillarHeights,
  levelEndThreshold,
  pillarCount,
} from "./game/pillars";
import {
  gameReducer,
  initialState,
  isEndOfLevel,
  isScrolling,
  showFlame as shouldShowFlame,
} from "./game/state";
import { appendEvent, type Recording } from "./game/recording";
import {
  getStoredPlayerName,
  leaderboard,
  setStoredPlayerName,
  type RunWithRecording,
} from "./lib/leaderboard";
import { TitleScreen } from "./components/TitleScreen";
import { GameOverScreen } from "./components/GameOverScreen";
import { LevelUpOverlay } from "./components/LevelUpOverlay";
import { GameplayBackground } from "./components/GameplayBackground";
import { Pillars } from "./components/Pillars";
import { Player } from "./components/Player";
import { Ghost } from "./components/Ghost";

const CRASH_DELAY_MS = 3000;
const LEVEL_END_DELAY_MS = 3000;

type PillarRef = RefObject<HTMLDivElement | null>;

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const playerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(() => window.innerHeight);

  const [pillarHeights, setPillarHeights] = useState<[number, number][]>(() =>
    generatePillarHeights(initialState.level),
  );
  const [pillarRefs, setPillarRefs] = useState<[PillarRef, PillarRef][]>(() =>
    Array.from({ length: pillarCount(initialState.level) }, () => [
      createRef<HTMLDivElement>(),
      createRef<HTMLDivElement>(),
    ]),
  );

  // ---- Recording ----------------------------------------------------------
  const recordingRef = useRef<Recording>([]);
  const recordingStartRef = useRef<number | null>(null);
  const [runId, setRunId] = useState(0);

  // ---- Ghost --------------------------------------------------------------
  const [ghostRun, setGhostRun] = useState<RunWithRecording | null>(null);
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);

  // ---- Submission ---------------------------------------------------------
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [playerName, setPlayerName] = useState(() => getStoredPlayerName());

  useEffect(() => {
    leaderboard.bestRunWithRecording().then(setGhostRun);
  }, [leaderboardRefresh]);

  useEffect(() => {
    const onResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Regenerate pillars whenever the level changes (or on resize, to keep heights fresh).
  useLayoutEffect(() => {
    const count = pillarCount(state.level);
    setPillarHeights(generatePillarHeights(state.level));
    setPillarRefs(
      Array.from({ length: count }, () => [
        createRef<HTMLDivElement>(),
        createRef<HTMLDivElement>(),
      ]),
    );
  }, [state.level, windowHeight]);

  // Phase-driven timeouts.
  useEffect(() => {
    if (state.phase === "crashing") {
      const id = window.setTimeout(
        () => dispatch({ type: "FINALIZE_CRASH" }),
        CRASH_DELAY_MS,
      );
      return () => window.clearTimeout(id);
    }
    if (state.phase === "levelEnding") {
      const id = window.setTimeout(
        () => dispatch({ type: "FINALIZE_LEVEL_END" }),
        LEVEL_END_DELAY_MS,
      );
      return () => window.clearTimeout(id);
    }
  }, [state.phase]);

  // Recording lifecycle: start a fresh tape when a run begins; stop when it ends.
  useEffect(() => {
    if (state.phase === "playing" && recordingStartRef.current === null) {
      recordingStartRef.current = performance.now();
      recordingRef.current = [[0, false]];
      setRunId((id) => id + 1);
      setSubmitted(false);
    }
    if (state.phase === "title" || state.phase === "idle") {
      // resetting state outside an active run
      if (state.phase === "idle" && state.level === 1) {
        recordingStartRef.current = null;
      }
    }
  }, [state.phase, state.level]);

  // Capture every playerUp edge into the tape.
  useEffect(() => {
    if (recordingStartRef.current === null) return;
    if (state.phase !== "playing") return;
    const t = performance.now() - recordingStartRef.current;
    recordingRef.current = appendEvent(recordingRef.current, t, state.playerUp);
  }, [state.playerUp, state.phase]);

  // On game over, freeze the recording (it stays in recordingRef for submission).
  useEffect(() => {
    if (state.phase === "gameOver") {
      recordingStartRef.current = null;
    }
  }, [state.phase]);

  const tick = useCallback(() => {
    if (state.phase !== "playing") return;
    if (!playerRef.current) return;

    const player = playerRef.current.getBoundingClientRect();
    const pillarCoords = pillarRefs
      .flatMap((tuple) => tuple)
      .filter((ref): ref is RefObject<HTMLDivElement> => ref.current !== null)
      .map((ref) => ref.current.getBoundingClientRect());

    const overlapping = pillarCoords.some(
      (rect) =>
        !(
          player.right < rect.left ||
          player.left > rect.right ||
          player.bottom < rect.top ||
          player.top > rect.bottom
        ) ||
        player.y < 0 ||
        player.y > window.innerHeight - player.height,
    );

    if (overlapping) {
      dispatch({ type: "CRASH" });
      return;
    }

    const passed =
      pillarCoords.filter((p) => player.left - player.width > p.left).length /
      2;
    dispatch({
      type: "SET_LEVEL_SCORE",
      score: passed,
      threshold: levelEndThreshold(state.level),
    });
  }, [state.phase, state.level, pillarRefs]);

  useRequestAnimationFrame(tick);

  useEffect(() => {
    if (state.phase !== "playing") return;
    const goUp = (e: PointerEvent) => {
      e.preventDefault();
      dispatch({ type: "INPUT_UP" });
    };
    const goDown = (e: PointerEvent) => {
      e.preventDefault();
      dispatch({ type: "INPUT_DOWN" });
    };
    window.addEventListener("pointerdown", goUp);
    window.addEventListener("pointerup", goDown);
    return () => {
      window.removeEventListener("pointerdown", goUp);
      window.removeEventListener("pointerup", goDown);
    };
  }, [state.phase]);

  const distanceToScroll = useMemo(() => {
    return (
      window.innerWidth * 0.7 + pillarCount(state.level) * DIST_BETWEEN_PILLARS
    );
  }, [state.level, windowHeight]); // eslint-disable-line react-hooks/exhaustive-deps

  const speedOfScroll = (distanceToScroll / 2.5) * 10;
  const scrolling = isScrolling(state.phase);

  const handleSubmitName = async (name: string) => {
    if (submitting || submitted) return;
    setSubmitting(true);
    setPlayerName(name);
    setStoredPlayerName(name);
    try {
      await leaderboard.submitRun({
        name,
        score: state.gameScore,
        level: state.level,
        recording: recordingRef.current,
      });
      setSubmitted(true);
      setLeaderboardRefresh((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden text-white">
      <GameplayBackground scrolling={scrolling} />

      {state.phase !== "title" && state.phase !== "gameOver" && (
        <div className="fixed top-0 p-4 h-16 w-full text-2xl z-10">
          Score: {state.gameScore}
        </div>
      )}

      <div
        ref={mapRef}
        className={cx("relative h-full", {
          "transition-transform ease-linear": scrolling,
        })}
        style={{
          transform: scrolling
            ? `translateX(${distanceToScroll * -1}px)`
            : undefined,
          transitionDuration: scrolling ? `${speedOfScroll}ms` : undefined,
        }}
      >
        <Pillars refs={pillarRefs} heights={pillarHeights} />
      </div>

      {ghostRun && (
        <Ghost
          recording={ghostRun.recording}
          runId={`${ghostRun.id}:${runId}`}
          active={state.phase === "playing"}
          windowHeight={windowHeight}
        />
      )}

      <Player
        ref={playerRef}
        playerUp={state.playerUp}
        isMovingDown={isEndOfLevel(state.phase) || scrolling}
        hasCrashed={state.phase === "crashing"}
        isIdle={state.phase === "title" || state.phase === "idle"}
        showFlame={shouldShowFlame(state.phase)}
        windowHeight={windowHeight}
      />

      {state.phase === "gameOver" && (
        <GameOverScreen
          level={state.level}
          score={state.gameScore}
          onRestart={() => dispatch({ type: "RESTART" })}
          onSubmitName={handleSubmitName}
          initialName={playerName}
          submitting={submitting}
          submitted={submitted}
          refreshKey={leaderboardRefresh}
        />
      )}

      <LevelUpOverlay
        nextLevel={state.level + 1}
        active={state.phase === "levelTransition"}
        onAnimationEnd={() => dispatch({ type: "ADVANCE_LEVEL" })}
      />

      {/* Invisible veil prevents iOS long-press issues during play. */}
      {scrolling && (
        <div
          className="veil fixed w-full h-full inset-0 text-7xl duration-0 flex justify-center items-center"
          onTouchStart={(e) => e.preventDefault()}
          onTouchEnd={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
          onTouchCancel={(e) => e.preventDefault()}
        />
      )}

      {state.phase === "idle" && (
        <div
          className="veil fixed w-full h-full inset-0 text-7xl duration-0 flex justify-center items-center"
          onClick={() => dispatch({ type: "START_PLAY" })}
        />
      )}

      {state.phase === "title" && (
        <TitleScreen onDismiss={() => dispatch({ type: "DISMISS_TITLE" })} />
      )}
    </div>
  );
}
