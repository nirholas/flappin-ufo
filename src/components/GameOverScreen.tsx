import { AnimatedBackground } from "../AnimatedBackground";
import { Leaderboard } from "./Leaderboard";
import { NameInput } from "./NameInput";

type Props = {
  level: number;
  score: number;
  onRestart: () => void;
  onSubmitName: (name: string) => void;
  initialName: string;
  submitting: boolean;
  submitted: boolean;
  refreshKey: unknown;
};

export const GameOverScreen = ({
  level,
  score,
  onRestart,
  onSubmitName,
  initialName,
  submitting,
  submitted,
  refreshKey,
}: Props) => (
  <div className="veil fixed w-full h-full inset-0 bg-black/50 text-white text-4xl flex justify-center items-center">
    <AnimatedBackground startGame={false} />
    <div className="relative p-4 w-screen flex flex-col gap-2 justify-center items-center text-center">
      <h2 className="text-7xl mb-4">GAME OVER</h2>
      <p className="text-2xl">Level: {level}</p>
      <p className="text-2xl">Final Score: {score}</p>
      {score > 0 && (
        <div className="mt-6">
          <NameInput
            initialName={initialName}
            onSubmit={onSubmitName}
            submitting={submitting}
            submitted={submitted}
          />
        </div>
      )}
      <div className="w-72 max-w-[80vw]">
        <Leaderboard limit={5} refreshKey={refreshKey} />
      </div>
      <div className="mt-6 flex justify-center items-center gap-8 flex-wrap">
        <button
          onClick={onRestart}
          className="animate-pulse px-4 py-2 rounded-md bg-[#5caa91] text-black outline-none hover:bg-[#7dcab1] focus:bg-[#7dcab1] transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  </div>
);
