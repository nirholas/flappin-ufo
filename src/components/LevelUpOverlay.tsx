import cx from "classnames";

type Props = {
  nextLevel: number;
  active: boolean;
  onAnimationEnd: () => void;
};

export const LevelUpOverlay = ({ nextLevel, active, onAnimationEnd }: Props) => (
  <div
    className={cx(
      "veil fixed w-full h-full inset-0 text-7xl duration-0 flex justify-center items-center",
      { "animate-level-screen": active },
    )}
    style={{ transform: "translateY(-100%)" }}
    onAnimationEnd={onAnimationEnd}
  >
    Level {nextLevel}
  </div>
);
