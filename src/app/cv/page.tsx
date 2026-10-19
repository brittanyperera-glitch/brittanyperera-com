import type { Metadata } from "next";
import { CvDocument } from "@/components/cv/CvDocument";
import { cv } from "@/content/cv";
import "@/styles/cv-print.css";

export const metadata: Metadata = { title: cv.metaTitle };

export default function CvPage() {
  return (
    <main className="cv">
      <CvDocument />
    </main>
  );
}
