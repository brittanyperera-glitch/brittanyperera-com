import type { MetadataRoute } from "next";
import { meta } from "@/content/meta";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/cv"].map((path) => ({ url: `${meta.siteUrl}${path}` }));
}
