import { forwardRef } from "react";
import cx from "classnames";
import Alien from "../images/alien.png";
import Flame from "../images/flame.png";

type Props = {
  playerUp: boolean;
  isMovingDown: boolean;
  hasCrashed: boolean;
  isIdle: boolean;
  showFlame: boolean;
  windowHeight: number;
};

const getTransform = (
  playerUp: boolean,
  isMovingDown: boolean,
  windowHeight: number,
) => {
  if (isMovingDown && !playerUp) return `translateY(${windowHeight * 2}px)`;
  if (playerUp) return `translateY(${windowHeight * -1}px)`;
  return undefined;
};

export const Player = forwardRef<HTMLDivElement, Props>(
  ({ playerUp, isMovingDown, hasCrashed, isIdle, showFlame, windowHeight }, ref) => {
    const animating = isMovingDown || playerUp;
    return (
      <div
        ref={ref}
        className={cx(
          "fixed left-1/4 top-1/2 -mt-8 w-16 h-16 ease-in will-change-transform",
          {
            "ease-in": isMovingDown && !playerUp,
            "ease-out-in": playerUp,
          },
        )}
        style={{
          transform: getTransform(playerUp, isMovingDown, windowHeight),
          transitionDuration: animating ? "2000ms" : undefined,
          transitionProperty: "transform",
        }}
      >
        <div
          className={cx({
            "duration-0 transition-transform": !hasCrashed,
            "rotate-180 duration-500": hasCrashed,
            "animate-idle-hover": isIdle,
          })}
        >
          <img src={Alien} alt="" />
          {showFlame && (
            <img
              src={Flame}
              alt=""
              className={cx(
                "m-auto max-w-none transition-opacity duration-200",
                {
                  "opacity-1": playerUp,
                  "opacity-0": !playerUp,
                },
              )}
              width={41}
              height={51}
            />
          )}
        </div>
      </div>
    );
  },
);
Player.displayName = "Player";
