# giac-wasm

[Giac](https://www-fourier.univ-grenoble-alpes.fr/~parisse/giac.html), the
computer algebra system of Xcas, compiled to WebAssembly, served for direct
use in web pages: <https://s-celles.github.io/giac-wasm/>.

The package itself, its sources and its build live in the
[giac repository](https://github.com/JuliaGiac/giac/tree/dev/npm) (`npm/`).
This repository only publishes its releases on GitHub Pages, and a
playground to try Giac in the browser.

## Using a release by URL

Every release is served by version, with CORS and `giac.wasm` as
`application/wasm`, so a page on any site can import it:

```html
<script type="module">
  import { loadGiac } from 'https://s-celles.github.io/giac-wasm/0.1.0/src/index.mjs';
  const giac = await loadGiac();
  console.log(giac.eval('factor(x^4-1)'));   // (x-1)*(x+1)*(x^2+1)
</script>
```

`latest/` is the newest release, and `versions.json` lists them all. The API
is documented in the package's
[README](https://github.com/JuliaGiac/giac/blob/dev/npm/README.md). For a
page that should not change under it, import a version, not `latest/`.

## How the site is built

`.github/workflows/pages.yml` downloads the zip of every giac-wasm release of
[JuliaGiac/giac](https://github.com/JuliaGiac/giac/releases) (tags
`giac-wasm-vX.Y.Z`, published by its `wasm-release.yml`), checks it against the
release's `SHA256SUMS`, and unpacks it into its version folder
(`scripts/fetch-releases.sh`, `scripts/assemble.sh`), next to the playground
(`playground/`). It runs on every push to `main`, every day, and by hand: a
new release is online at the latest the next day, or at once by running the
workflow.

Locally:

```bash
just fetch    # the releases, into releases/ (needs gh)
just serve    # assemble _site/ and serve it at http://localhost:8000
```

Giac is © Bernard Parisse and Renée De Graeve, Institut Fourier, Université
Grenoble Alpes, distributed under the GNU General Public License, version 3
or later; so is this repository (see `LICENSE`).
