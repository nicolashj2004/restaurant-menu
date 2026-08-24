import { ImageResponse } from "next/og";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#171717",
          color: "#f2c879",
          fontSize: 260,
          fontWeight: 700,
          fontFamily: "serif",
        }}
      >
        S
      </div>
    ),
    { width: 512, height: 512 }
  );
}
