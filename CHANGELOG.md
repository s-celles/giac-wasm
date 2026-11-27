# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Before the first giac-wasm release, the playground said so only in small
  grey text, left Evaluate disabled without explanation and showed an empty
  snippet. It now shows a notice saying where releases come from, and the
  snippet with `<version>` in place of a version.

### Added
- GitHub Pages site, <https://s-celles.github.io/giac-wasm/>: every giac-wasm
  release of JuliaGiac/giac (tags `giac-wasm-vX.Y.Z`), its zip checked against
  the release's SHA256SUMS and unpacked into its version folder, the newest
  also as `latest/`, and `versions.json`; deployed on every push, every day,
  and by hand (`pages.yml`).
- A playground page: Giac in a Web Worker (a Stop button terminates it),
  examples, SVG plots shown as images (GIAC's SVG, not well-formed XML, is
  read as HTML and written back as XML first), GIAC's messages apart from results,
  a choice of version, and the snippet to import that version in a page.
- `just fetch`, `just assemble` and `just serve` to build and try the site
  locally.
