import React from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const base = {
  fontFamily: "Sora, sans-serif",
  backgroundColor: "#101010",
  color: "#eeeee6",
  overflow: "hidden",
};
function Word({
  children,
  at = 0,
  x = 60,
  y = 0,
  color = "#eeeee6",
  size = 116,
}) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: f - at,
    fps,
    config: { damping: 22, stiffness: 100 },
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontSize: size,
        lineHeight: 1.03,
        fontWeight: 600,
        letterSpacing: -7,
        color,
        opacity: interpolate(f, [at, at + 8], [0, 1], clamp),
        transform: `translateY(${(1 - enter) * 65}px)`,
      }}
    >
      {children}
    </div>
  );
}
export function BrandFilm() {
  const f = useCurrentFrame();
  const chapter = f < 120 ? 0 : f < 260 ? 1 : 2;
  const art = new URL("./assets/logo.webp", document.baseURI).href;
  return (
    <AbsoluteFill style={base}>
      <div
        style={{
          position: "absolute",
          top: 31,
          left: 48,
          right: 48,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "DM Sans, sans-serif",
          fontSize: 15,
          color: "#999991",
          zIndex: 5,
        }}
      >
        <span>WunderHub / Estudo de movimento</span>
        <span>Design + código</span>
      </div>
      {chapter === 0 && (
        <>
          <Word at={4} y={144}>
            Uma ideia.
          </Word>
          <Word at={18} y={286}>
            Muitas formas.
          </Word>
          <div
            style={{
              position: "absolute",
              right: 70,
              bottom: 72,
              width: 110,
              height: 110,
              background: "#ef423b",
              transform: `rotate(${interpolate(f, [0, 120], [-35, 0], clamp)}deg) scale(${spring({ frame: f - 25, fps: 30, config: { damping: 18 } })})`,
            }}
          />
        </>
      )}
      {chapter === 1 && (
        <AbsoluteFill style={{ background: "#c83c34" }}>
          <div
            style={{
              position: "absolute",
              left: -30,
              top: 125,
              display: "flex",
              gap: 24,
              transform: `translateX(${interpolate(f, [120, 260], [120, -120], clamp)}px) rotate(-7deg)`,
            }}
          >
            {["DESIGN", "CÓDIGO", "MOVIMENTO"].map((word, i) => (
              <div
                key={word}
                style={{
                  fontSize: 145,
                  fontWeight: 650,
                  letterSpacing: -10,
                  whiteSpace: "nowrap",
                  color: i === 1 ? "#20201d" : "#f1e9df",
                }}
              >
                {word}
              </div>
            ))}
          </div>
          <Word at={136} x={58} y={365} color="#20201d" size={84}>
            Cada detalhe responde.
          </Word>
          <div
            style={{
              position: "absolute",
              left: 62,
              bottom: 75,
              fontSize: 22,
              fontFamily: "DM Sans, sans-serif",
              opacity: interpolate(f, [155, 172], [0, 1], clamp),
            }}
          >
            À sua marca. À sua ideia. A quem vai usar.
          </div>
        </AbsoluteFill>
      )}
      {chapter === 2 && (
        <>
          <Img
            src={art}
            style={{
              position: "absolute",
              width: 350,
              height: 175,
              objectFit: "contain",
              left: 465,
              top: 80,
              opacity: interpolate(f, [264, 285], [0, 1], clamp),
              transform: `translateY(${interpolate(f, [264, 295], [20, 0], clamp)}px)`,
            }}
          />
          <Word at={275} x={210} y={292} size={138}>
            WunderHub.
          </Word>
          <div
            style={{
              position: "absolute",
              top: 472,
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: "DM Sans, sans-serif",
              fontSize: 24,
              opacity: interpolate(f, [290, 307], [0, 1], clamp),
            }}
          >
            Design, código e movimento.
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 65,
              textAlign: "center",
              fontFamily: "DM Sans, sans-serif",
              fontSize: 17,
              color: "#aaa99f",
            }}
          >
            Por Kauê Ribeiro
          </div>
        </>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          height: 4,
          background: "#ef423b",
          width: `${(f / 419) * 100}%`,
        }}
      />
    </AbsoluteFill>
  );
}
export function mountReel(container, { autoplay = false } = {}) {
  const root = createRoot(container);
  root.render(
    <Player
      component={BrandFilm}
      durationInFrames={420}
      fps={30}
      compositionWidth={1280}
      compositionHeight={720}
      controls
      autoPlay={autoplay}
      clickToPlay
      doubleClickToFullscreen={false}
      spaceKeyToPlayPause
      showVolumeControls={false}
      style={{ width: "100%", aspectRatio: "16/9" }}
    />,
  );
  return () => root.unmount();
}
