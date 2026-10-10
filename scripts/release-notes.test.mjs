import assert from "node:assert/strict";
import { test } from "node:test";
import { extractReleaseNotes } from "./release-notes.mjs";

const changelog = `# Changelog

## 0.2.0

Lede.

### Fixes

- Fix a thing.

## 0.1.0

Old.
`;

test("returns the section body without its heading", () => {
  assert.equal(extractReleaseNotes(changelog, "0.2.0"), "Lede.\n\n### Fixes\n\n- Fix a thing.\n");
});

test("reads the last section to end of file", () => {
  assert.equal(extractReleaseNotes(changelog, "0.1.0"), "Old.\n");
});

test("does not match a version prefix", () => {
  assert.equal(extractReleaseNotes(changelog, "0.2"), null);
  assert.equal(extractReleaseNotes("## 0.2.0.1\n\nx\n", "0.2.0"), null);
});

test("returns null for a missing or empty section", () => {
  assert.equal(extractReleaseNotes(changelog, "9.9.9"), null);
  assert.equal(extractReleaseNotes("## 1.0.0\n\n## 0.9.0\n", "1.0.0"), null);
});
