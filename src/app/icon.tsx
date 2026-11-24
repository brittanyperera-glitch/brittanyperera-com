import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// A beige box of a computer: 2px grid cells scaled up so the pixels stay square.
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#c8c8c8",
      }}
    >
      <div
        style={{
          width: 26,
          height: 20,
          background: "#d8d8d8",
          border: "2px solid #222",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 16, height: 11, background: "#3a6ea5", border: "1px solid #222" }} />
      </div>
      <div style={{ width: 14, height: 4, background: "#888", border: "1px solid #222" }} />
    </div>,
    size,
  );
}
