import { ImageResponse } from "next/og";
import { cv } from "@/content/cv";
import { meta } from "@/content/meta";

export const alt = meta.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GREY = "#c8c8c8";
const BLUE = "#3a6ea5";
const INK = "#1a1a1a";
const bevel = {
  borderTop: "4px solid #fff",
  borderLeft: "4px solid #fff",
  borderRight: "4px solid #666",
  borderBottom: "4px solid #666",
};

function Computer() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          width: 300,
          height: 250,
          background: "#d8d8d8",
          border: `6px solid ${INK}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 220,
            height: 170,
            background: BLUE,
            border: `6px solid ${INK}`,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            padding: 14,
          }}
        >
          <div style={{ width: 60, height: 44, background: GREY, ...bevel }} />
        </div>
      </div>
      <div style={{ width: 90, height: 24, background: "#999", border: `6px solid ${INK}` }} />
      <div style={{ width: 200, height: 24, background: "#bbb", border: `6px solid ${INK}` }} />
    </div>
  );
}

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: GREY,
        fontFamily: "monospace",
        color: INK,
      }}
    >
      <div
        style={{
          height: 56,
          background: BLUE,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          fontSize: 28,
        }}
      >
        {meta.siteHost}
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 70px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 650 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>{cv.name}</div>
          <div style={{ fontSize: 36, marginTop: 24, color: "#333" }}>{cv.headline}</div>
          <div style={{ fontSize: 30, marginTop: 40, color: BLUE }}>{meta.siteHost}</div>
        </div>
        <Computer />
      </div>
    </div>,
    size,
  );
}
