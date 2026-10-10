#!/usr/bin/env bash
# Sets each existing desktop-v<version> release body to its CHANGELOG.md
# section. Release notes stay editable on immutable releases, so this covers
# notes that land after the release and backfills older releases.
# DRY_RUN=1 reports the releases it would edit without editing them.
set -euo pipefail

changelog="${1:-CHANGELOG.md}"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
notes="$(mktemp)"
trap 'rm -f "$notes"' EXIT

sed -n 's/^## \(.*[^[:space:]]\)[[:space:]]*$/\1/p' "$changelog" | while IFS= read -r version; do
  tag="desktop-v${version}"
  if ! current="$(gh release view "$tag" --json body --jq .body 2>/dev/null)"; then
    echo "skip ${tag}: no release"
    continue
  fi
  if ! node "$script_dir/release-notes.mjs" "$version" "$changelog" > "$notes"; then
    echo "skip ${tag}: empty section"
    continue
  fi
  if [[ "$current" == "$(cat "$notes")" ]]; then
    echo "ok   ${tag}"
  elif [[ "${DRY_RUN:-}" == "1" ]]; then
    echo "edit ${tag} (dry run)"
  else
    gh release edit "$tag" --notes-file "$notes" > /dev/null
    echo "edit ${tag}"
  fi
done
