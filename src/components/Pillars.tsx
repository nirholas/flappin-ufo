import { type RefObject } from "react";
import Asteroid from "../images/asteroid.png";
import { DIST_BETWEEN_PILLARS } from "../game/pillars";

type PillarRef = RefObject<HTMLDivElement | null>;

type Props = {
  refs: [PillarRef, PillarRef][];
  heights: [number, number][];
};

const getTranslateX = (index: number) =>
  index === 0
    ? "translateX(70vw)"
    : `translateX(calc(70vw + ${DIST_BETWEEN_PILLARS * index}px))`;

export const Pillars = ({ refs, heights }: Props) => (
  <>
    {refs.map(([refTop, refBottom], index) => (
      <div key={index}>
        <div
          ref={refTop}
          className="absolute top-0 w-16 bg-bottom"
          style={{
            backgroundImage: `url(${Asteroid})`,
            transform: getTranslateX(index),
            height: heights[index][0] + "%",
            backgroundSize: "100%",
          }}
        />
        <div
          ref={refBottom}
          className="absolute bottom-0 w-16"
          style={{
            backgroundImage: `url(${Asteroid})`,
            transform: getTranslateX(index),
            height: heights[index][1] + "%",
            backgroundSize: "100%",
          }}
        />
      </div>
    ))}
  </>
);
