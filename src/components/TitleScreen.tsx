import { AnimatedBackground } from "../AnimatedBackground";
import { Leaderboard } from "./Leaderboard";

type Props = {
  onDismiss: () => void;
};

export const TitleScreen = ({ onDismiss }: Props) => (
  <div
    className="veil leading-none fixed w-full h-full bg-[#091c3e] inset-0 text-white text-4xl flex flex-col justify-center items-center"
    onClick={onDismiss}
  >
    <AnimatedBackground startGame={false} />
    <div className="animate-pulse relative text-4xl">
      <h1 className="skew-x-6 leading-none rotate-[-20deg] text-7xl absolute inset-0 -mt-0.5 -ml-0.5">
        <p className="leading-none text-[#fff]">FLAPPIN</p>
        <p className="ml-5 leading-none -mt-4 text-[#fff]">UFO</p>
      </h1>
      <h1 className="skew-x-6 leading-none rotate-[-20deg] text-7xl">
        <p className="leading-none text-[#6fc4a9]">FLAPPIN</p>
        <p className="ml-5 leading-none -mt-4 text-[#8db5e7]">UFO</p>
      </h1>
    </div>
    <p className="relative mt-16 text-lg">Tap to play</p>
    <div
      className="relative w-72 max-w-[80vw] text-white"
      onClick={(e) => e.stopPropagation()}
    >
      <Leaderboard limit={5} />
    </div>
  </div>
);
