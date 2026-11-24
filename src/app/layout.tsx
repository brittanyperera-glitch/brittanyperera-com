import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cv } from "@/content/cv";
import { meta } from "@/content/meta";

export const metadata: Metadata = {
  metadataBase: new URL(meta.siteUrl),
  title: meta.title,
  description: meta.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: meta.title,
    title: meta.title,
    description: meta.description,
  },
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
  },
};

const personJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: cv.name,
  alternateName: meta.alternateName,
  url: meta.siteUrl,
  jobTitle: cv.headline,
  sameAs: [cv.linkedin, cv.github],
  alumniOf: { "@type": "CollegeOrUniversity", name: meta.alumniOf },
}).replace(/</g, "\\u003c");

// Only parsed when scripting is off. The boot and setup overlays need JavaScript to ever go away, so
// hide them, and lay the windows out as a plain readable column (menus, icons and the Projects
// folder are all buttons that do nothing without scripts). !important beats the inline desktop
// placement and the phone stylesheet's full-screen rules.
const NO_JS_CSS = `
.boot, .setup { display: none !important; }
html:has(.desktop), body:has(.desktop) { height: auto !important; overflow: auto !important; }
.desktop { position: static !important; }
.desktop .menubar, .desktop .icons, .desktop .phone-status, .desktop .phone-home, .desktop .win[data-win="projects"] { display: none !important; }
.desktop .win[data-win="note"], .desktop .win[data-win="note"][hidden] { display: none !important; }
.desktop .win[data-win^="browser:"], .desktop .win[data-win^="browser:"][hidden] { display: none !important; }
.desktop .win, .desktop .win[hidden] {
  display: block !important;
  position: static !important;
  width: auto !important;
  max-width: none !important;
  margin: 12px !important;
  z-index: auto !important;
}
.desktop .win .body { max-height: none !important; overflow: visible !important; }
@media (max-width: 700px) {
  .desktop .win[data-win="cv"] {
    margin: 22px 0 0 !important;
    min-height: calc(100dvh - 22px);
  }
}
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: serialised from our own content, "<" escaped */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd }} />
        <noscript>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a static constant, never user input */}
          <style dangerouslySetInnerHTML={{ __html: NO_JS_CSS }} />
        </noscript>
      </body>
    </html>
  );
}
