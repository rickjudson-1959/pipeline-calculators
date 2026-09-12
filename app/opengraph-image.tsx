import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#1f497d",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#d6e3f0",
          }}
        >
          Pipe-Up
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 16 }}>
          Pipeline Calculators
        </div>
        <div style={{ fontSize: 32, marginTop: 18, color: "#d6e3f0" }}>
          Hydrostatic test and wall thickness sizing for the field and the office
        </div>
      </div>
    ),
    size,
  );
}
