import { ImageResponse } from "next/og";

/**
 * The share card — generated, not a static file, so it can never 404 and never drift from the
 * copy. Styled inline because this renders in isolation: no globals.css, no Tailwind, just the
 * brand's paper-and-ink palette by hand.
 */

export const alt = "Disruptajob: your CV doesn't do you justice";
export const size = { width: 1200, height: 630 };
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
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#f7f5f0",
          color: "#1a1815",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, letterSpacing: 2 }}>Disruptajob</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, lineHeight: 1.15 }}>
            Your CV doesn&rsquo;t
          </div>
          <div style={{ display: "flex", fontSize: 76, lineHeight: 1.15 }}>
            do you justice.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: 30,
              color: "#5c564c",
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            Show the work instead. Free for candidates. Hidden until you say otherwise.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            borderTop: "2px solid #b4543a",
            paddingTop: 24,
            fontSize: 26,
            color: "#b4543a",
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          disruptajob.com
        </div>
      </div>
    ),
    size
  );
}
