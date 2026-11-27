#!/usr/bin/env bash
# Assemble the site: the playground, each release unzipped into its version
# folder, the newest one also as latest/, and versions.json.
# Usage: assemble.sh [ZIPS_DIR] [OUT_DIR]  (default: releases _site)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ZIPS="${1:-releases}"
OUT="${2:-_site}"

rm -rf "$OUT"
mkdir -p "$OUT"
cp -r "$ROOT/playground/." "$OUT/"

versions=()
shopt -s nullglob
for zip in "$ZIPS"/giac-wasm-*.zip; do
  version="$(basename "$zip" .zip)"
  version="${version#giac-wasm-}"
  [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "skipping $zip" >&2; continue; }
  tmp="$(mktemp -d)"
  unzip -q "$zip" -d "$tmp"
  [ -f "$tmp/giac-wasm-$version/src/index.mjs" ] || { echo "$zip has no giac-wasm-$version/src/index.mjs" >&2; exit 1; }
  mv "$tmp/giac-wasm-$version" "$OUT/$version"
  rm -rf "$tmp"
  versions+=("$version")
done

latest=""
if [ "${#versions[@]}" -gt 0 ]; then
  latest="$(printf '%s\n' "${versions[@]}" | sort -V | tail -n 1)"
  cp -r "$OUT/$latest" "$OUT/latest"
fi

# {"latest": "0.2.0", "versions": ["0.2.0", "0.1.0"]}, newest first
{
  printf '{"latest": %s, "versions": [' "$( [ -n "$latest" ] && printf '"%s"' "$latest" || printf 'null')"
  if [ "${#versions[@]}" -gt 0 ]; then
    printf '%s\n' "${versions[@]}" | sort -rV | sed 's/.*/"&"/' | paste -sd, - | sed 's/,/, /g' | tr -d '\n'
  fi
  printf ']}\n'
} > "$OUT/versions.json"

echo "assembled $OUT: ${versions[*]:-no release} (latest: ${latest:-none})"
