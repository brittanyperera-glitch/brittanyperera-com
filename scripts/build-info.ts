import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

// A bare it( or test( call, or an .each form counted once; .skip, .todo and .fixme never match.
// The lookbehind skips regex calls such as /x/.test( and names ending in "test".
const CALL = /(?<![\w.])(?:it|test)(?:\.each\b|\s*\()/g;

const LABELS: [string, string][] = [
  ["next", "Next.js"],
  ["react", "React"],
  ["typescript", "TypeScript"],
];

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

export function countTests(files: string[]): number {
  return files.reduce((n, f) => n + (readFileSync(f, "utf8").match(CALL)?.length ?? 0), 0);
}

export function buildInfo(base = root) {
  const pkg = JSON.parse(readFileSync(join(base, "package.json"), "utf8")) as {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  const deps = { ...pkg.devDependencies, ...pkg.dependencies };
  const stack = LABELS.map(([name, label]) => {
    const v = deps[name];
    if (!v) throw new Error(`${name} is not in package.json`);
    return `${label} ${v.replace(/^\D*/, "")}`;
  });
  const tests = join(base, "tests");
  return {
    stack,
    unitTests: countTests(walk(tests).filter((f) => /\.test\.tsx?$/.test(f))),
    e2eTests: countTests(walk(join(tests, "e2e")).filter((f) => f.endsWith(".spec.ts"))),
  };
}

if (process.argv[1] === import.meta.filename) {
  try {
    const out = join(root, "src/content/build-info.json");
    writeFileSync(out, `${JSON.stringify(buildInfo(), null, 2)}\n`);
    // Biome's JSON layout differs from JSON.stringify; format so `pnpm lint` stays green.
    execFileSync("pnpm", ["exec", "biome", "format", "--write", out], { cwd: root });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
