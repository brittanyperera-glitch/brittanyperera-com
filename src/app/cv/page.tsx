import type { Metadata } from "next";
import { CvDocument } from "@/components/cv/CvDocument";
import { cv } from "@/content/cv";
import { meta } from "@/content/meta";
import "@/styles/cv-print.css";

export const metadata: Metadata = {
  title: cv.metaTitle,
  description: meta.cvDescription,
  alternates: { canonical: "/cv" },
  openGraph: { url: "/cv", title: cv.metaTitle, description: meta.cvDescription },
};

export default function CvPage() {
  return (
    <main className="cv">
      <CvDocument standalone />
    </main>
  );
}
