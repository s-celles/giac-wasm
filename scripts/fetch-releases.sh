#!/usr/bin/env bash
# Download the zip of every giac-wasm release of the giac repository into
# DIR, each checked against the release's SHA256SUMS.
# Usage: fetch-releases.sh [REPO] [DIR]  (default: JuliaGiac/giac releases)
# Needs gh, authenticated (GH_TOKEN in GitHub Actions).
set -euo pipefail

REPO="${1:-JuliaGiac/giac}"
DIR="${2:-releases}"
mkdir -p "$DIR"

sha256() { if command -v sha256sum >/dev/null; then sha256sum "$1"; else shasum -a 256 "$1"; fi | cut -d' ' -f1; }

tags="$(gh api --paginate "repos/$REPO/releases" \
  -q '.[] | select(.draft | not) | .tag_name | select(test("^giac-wasm-v[0-9]+[.][0-9]+[.][0-9]+$"))')"
if [ -z "$tags" ]; then
  echo "no giac-wasm release in $REPO yet"
  exit 0
fi

for tag in $tags; do
  version="${tag#giac-wasm-v}"
  zip="giac-wasm-$version.zip"
  if [ -f "$DIR/$zip" ]; then continue; fi
  tmp="$(mktemp -d)"
  gh release download "$tag" -R "$REPO" -p "$zip" -p SHA256SUMS -D "$tmp"
  expected="$(awk -v f="$zip" '$2 == f { print $1 }' "$tmp/SHA256SUMS")"
  if [ -z "$expected" ] || [ "$(sha256 "$tmp/$zip")" != "$expected" ]; then
    echo "checksum mismatch for $zip of $tag" >&2
    exit 1
  fi
  mv "$tmp/$zip" "$DIR/"
  rm -rf "$tmp"
  echo "$DIR/$zip"
done
