#!/usr/bin/env node
// Prints the CHANGELOG.md section for one version, without its "## <version>"
// heading, for use as GitHub release notes. Exits 1 when the section is absent.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function extractReleaseNotes(markdown, version) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${version}`);
  if (start === -1) {
    return null;
  }
  let end = lines.findIndex((line, i) => i > start && /^## /.test(line));
  if (end === -1) {
    end = lines.length;
  }
  const body = lines.slice(start + 1, end).join("\n").trim();
  return body === "" ? null : `${body}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [version, file = "CHANGELOG.md"] = process.argv.slice(2);
  if (!version) {
    console.error("usage: release-notes.mjs <version> [changelog]");
    process.exit(2);
  }
  const notes = extractReleaseNotes(readFileSync(file, "utf8"), version);
  if (notes === null) {
    console.error(`No "## ${version}" section in ${file}.`);
    process.exit(1);
  }
  process.stdout.write(notes);
}
