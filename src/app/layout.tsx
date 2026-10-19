import type { Metadata } from "next";
import type { ReactNode } from "react";
import { meta } from "@/content/meta";

export const metadata: Metadata = {
  metadataBase: new URL("https://brittanyperera.com"),
  title: meta.title,
  description: meta.description,
  openGraph: {
    type: "website",
    url: "/",
    siteName: meta.title,
    title: meta.title,
    description: meta.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: meta.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
    images: ["/og.png"],
  },
};

// Only parsed when scripting is off: the boot and setup overlays need JavaScript to ever go away,
// so hide them and show About me instead of a frozen boot screen.
const NO_JS_CSS = `
.boot, .setup { display: none !important; }
.win[data-win="about"][hidden] { display: block; }
@media (max-width: 700px) { .win[data-win="about"][hidden] { display: flex; } }
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <noscript>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a static constant, never user input */}
          <style dangerouslySetInnerHTML={{ __html: NO_JS_CSS }} />
        </noscript>
      </body>
    </html>
  );
}
