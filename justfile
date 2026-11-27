# giac-wasm on GitHub Pages: the playground and the giac-wasm releases.
# Requires: https://github.com/casey/just

# List available recipes
default:
    @just --list

# Download the giac-wasm releases of JuliaGiac/giac into releases/ (needs gh)
fetch:
    scripts/fetch-releases.sh JuliaGiac/giac releases

# Assemble the site into _site/ from the zips in releases/
assemble:
    scripts/assemble.sh releases _site

# Serve _site/ at http://localhost:8000
serve: assemble
    python3 -m http.server --directory _site 8000
