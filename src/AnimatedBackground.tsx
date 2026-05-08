import Stars from "./images/vector-space.png"
import cx from "classnames"

type AnimatedBackgroundProps = {
  startGame: boolean
}

export const AnimatedBackground = ({ startGame }: AnimatedBackgroundProps) => {
  return (
    <div className="ImageWrap fixed inset-0 w-screen h-full">
      <img
        src={Stars}
        className={cx(
          "absolute left-0 bottom-0 h-auto w-[3077px] transition-transform max-w-none animate-title-screen"
        )}
        width={3000}
        height={1834}
        alt=""
      />
      <img
        src={Stars}
        className={cx(
          "absolute left-[3000px] bottom-0 h-auto w-[3077px] transition-transform max-w-none",
          {
            "duration-[30000ms]": startGame
          }
        )}
        style={{
          transform: startGame ? `translateX(-300px) scaleX(-1)` : undefined,
          transitionDuration: startGame ? "30000ms" : undefined
        }}
        width={3000}
        height={1834}
        alt=""
      />
      <div
        className="w-full h-full opacity-50"
        style={{
          background: "radial-gradient(rgb(26 31 59), rgb(0, 0, 0))"
        }}
      />
    </div>
  )
}
