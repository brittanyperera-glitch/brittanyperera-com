import { describe, expect, it } from "vitest";
import Image, { contentType, size } from "@/app/opengraph-image";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import TwitterImage from "@/app/twitter-image";

describe("seo routes", () => {
  it("robots points at the www sitemap", () => {
    const r = robots();
    expect(r.sitemap).toBe("https://www.brittanyperera.com/sitemap.xml");
    expect(r.host).toBe("https://www.brittanyperera.com");
  });
  it("sitemap lists / and /cv on www", () => {
    expect(sitemap().map((s) => s.url)).toEqual([
      "https://www.brittanyperera.com/",
      "https://www.brittanyperera.com/cv",
    ]);
  });
  it("renders a 1200x630 png", async () => {
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");
    const buf = new Uint8Array(await (await Image()).arrayBuffer());
    expect(Array.from(buf.slice(1, 4))).toEqual([80, 78, 71]);
    const dv = new DataView(buf.buffer);
    expect([dv.getUint32(16), dv.getUint32(20)]).toEqual([1200, 630]);
  });
  it("twitter image is the same card", () => {
    expect(TwitterImage).toBe(Image);
  });
  it("cv has its own og url, title and description", async () => {
    const { metadata } = await import("@/app/cv/page");
    expect(metadata.openGraph).toMatchObject({
      url: "/cv",
      title: metadata.title,
      description: metadata.description,
    });
  });
});
