import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NeuroCompass — Your neurodivergent-affirming companion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#B8D0AE",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px 100px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Left: text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
          {/* Eyebrow */}
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#4d6e5e",
            }}
          >
            Willow Creek Counselling
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: "#2D3B2E",
              lineHeight: 1,
              letterSpacing: "-2px",
            }}
          >
            NeuroCompass
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 34,
              color: "#3a5447",
              fontWeight: 500,
              lineHeight: 1.4,
              maxWidth: 560,
            }}
          >
            Your neurodivergent-affirming companion for everyday life
          </div>

          {/* URL pill */}
          <div
            style={{
              display: "flex",
              marginTop: 16,
              background: "#4d6e5e",
              color: "#fff",
              borderRadius: 999,
              padding: "12px 28px",
              fontSize: 22,
              fontWeight: 600,
              width: "fit-content",
            }}
          >
            neuro-compass.vercel.app
          </div>
        </div>

        {/* Right: compass graphic built from shapes */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.35)",
            border: "4px solid rgba(255,255,255,0.6)",
            flexShrink: 0,
            marginLeft: 60,
          }}
        >
          {/* Simple compass star shape using nested divs */}
          <div style={{ position: "relative", width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Outer circle ring */}
            <div style={{
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: "50%",
              border: "6px solid #4d6e5e",
              opacity: 0.5,
            }} />
            {/* N point */}
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 18, height: 80, background: "linear-gradient(to bottom, #5e8272, #9B8EC4)", borderRadius: 9 }} />
            {/* S point */}
            <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 18, height: 80, background: "linear-gradient(to top, #B8897A, #B8A96A)", borderRadius: 9 }} />
            {/* E point */}
            <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 80, height: 18, background: "linear-gradient(to right, #C4929A, #9B8EC4)", borderRadius: 9 }} />
            {/* W point */}
            <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 80, height: 18, background: "linear-gradient(to left, #5e8272, #4d7a80)", borderRadius: 9 }} />
            {/* Centre dot */}
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#4d6e5e", zIndex: 10 }} />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
