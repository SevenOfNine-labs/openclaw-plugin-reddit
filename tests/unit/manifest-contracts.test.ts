import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { ALL_TOOL_NAMES } from "../../src/tool-specs.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const manifest = JSON.parse(
  readFileSync(resolve(repoRoot, "openclaw.plugin.json"), "utf8"),
) as { contracts?: { tools?: unknown } };

/**
 * `contracts.tools` is the discovery contract: it tells OpenClaw which plugin
 * owns each tool without loading every installed plugin's runtime. Omitting it
 * made `openclaw plugins doctor` report "plugin must declare contracts.tools
 * before registering agent tools" seventeen times — once per tool the entry
 * loops over — and the tools were absent from discovery.
 *
 * The assertion compares against `ALL_TOOL_NAMES` rather than a transcribed
 * list, because a hand-written copy is exactly what drifts. Adding a tool to
 * `tool-specs.ts` without updating the manifest fails here.
 */
describe("openclaw.plugin.json contracts", () => {
  it("declares the tool contract at all", () => {
    expect(Array.isArray(manifest.contracts?.tools)).toBe(true);
  });

  it("declares exactly the tools the entry registers, in order", () => {
    expect(manifest.contracts?.tools).toEqual([...ALL_TOOL_NAMES]);
  });

  it("declares no duplicates", () => {
    const tools = manifest.contracts?.tools as string[];
    expect(new Set(tools).size).toBe(tools.length);
  });
});
