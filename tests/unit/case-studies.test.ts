import { describe, expect, it } from "vitest";
import buildInfo from "@/content/build-info.json";
import { projects } from "@/content/projects";

const PROBLEMS: Record<string, string> = {
  trip: "Five friends, one trip to Sri Lanka, no adventures gone un-adventured.",
  delulu: "The platform to get you to be the person you want to be.",
  site: "A website with all the stuff I want in it. Professional, but not boring and flat.",
  agents: "I want my agents to do what I want them to do before I tell them.",
  engine: "Jet engines lose efficiency between washes, and the timing of washes was guesswork.",
  radiator: "A radiator has to reject more heat while weighing less and costing less drag.",
};

describe("case studies", () => {
  it("lists six projects in the approved order", () => {
    expect(projects.map((p) => p.id)).toEqual([
      "trip",
      "delulu",
      "site",
      "agents",
      "engine",
      "radiator",
    ]);
  });
  it("gives every project a problem, a built line and a stack", () => {
    for (const p of projects) {
      expect(p.problem, p.id).toBeTruthy();
      expect(p.built, p.id).toBeTruthy();
      expect(p.stack?.length, p.id).toBeGreaterThan(0);
    }
  });
  it("uses the approved Problem line for each project", () => {
    for (const p of projects) expect(p.problem, p.id).toBe(PROBLEMS[p.id]);
  });
  it("states the same test counts as the About box", () => {
    const tens = (n: number) => Math.floor(n / 10) * 10;
    const site = projects.find((p) => p.id === "site");
    expect(site?.result).toMatch(
      new RegExp(
        `^${tens(buildInfo.unitTests)}\\+ unit and ${tens(buildInfo.e2eTests)}\\+ browser tests`,
      ),
    );
  });
});
