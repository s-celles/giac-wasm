// The playground page: sends inputs to Giac in a worker, shows the results.

const $ = (id) => document.getElementById(id);
const form = $('form');
const input = $('input');
const run = $('run');
const stop = $('stop');
const versionSelect = $('version');
const status = $('status');
const history = $('history');

const EXAMPLES = [
  'factor(x^4-1)',
  'integrate(1/(1+x^2),x)',
  'solve(x^3-2*x-4=0,x)',
  'limit(sin(x)/x,x,0)',
  'desolve(y\'\'+y=0,y)',
  'series(exp(x),x,0,6)',
  'det([[a,b],[c,d]])',
  'evalf(pi,50)',
  'ifactor(2^64+1)',
  'plot(sin(x)/x,x=-20..20)',
];

let worker = null;
let nextId = 0;
const pending = new Map(); // id => the history entry waiting for its result

function setStatus(text) {
  status.textContent = text;
}

// A GIAC string result keeps its quotes; an SVG plot is one.
function svgOf(result) {
  const m = result.match(/^"(<svg[\s\S]*<\/svg>)"?$/);
  return m ? m[1] : null;
}

function renderResult(entry, { result, error, messages }) {
  const out = entry.querySelector('.output');
  out.classList.remove('pending');
  out.textContent = '';
  if (error !== undefined) {
    out.classList.add('error');
    out.textContent = error;
  } else {
    const svg = svgOf(result);
    if (svg) {
      // as an image, so that nothing in the SVG runs
      // GIAC's SVG is not well-formed XML (attributes without a space between
      // them), which an image needs: read it as HTML, write it back as XML
      const el = new DOMParser().parseFromString(svg, 'text/html').querySelector('svg');
      const img = document.createElement('img');
      img.alt = 'plot';
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(el));
      out.append(img);
    } else {
      out.textContent = result;
    }
  }
  // GIAC also prints an error's text as a message
  messages = messages.filter((m) => m.trim() !== error?.trim());
  if (messages.length) {
    const msg = document.createElement('pre');
    msg.className = 'messages';
    msg.textContent = messages.join('\n');
    entry.append(msg);
  }
}

function startWorker(version) {
  worker?.terminate();
  for (const entry of pending.values()) {
    renderResult(entry, { error: 'Stopped: Giac was restarted, and its session cleared.', messages: [] });
  }
  pending.clear();
  run.disabled = true;
  stop.disabled = true;
  setStatus('Loading Giac…');
  worker = new Worker(`worker.mjs?v=${encodeURIComponent(version)}`, { type: 'module' });
  worker.onmessage = ({ data }) => {
    if (data.type === 'ready') {
      run.disabled = false;
      setStatus(`Giac ${data.version} (giac-wasm ${data.package})`);
      return;
    }
    if (data.type === 'fatal') {
      setStatus(`Could not load Giac: ${data.error}`);
      return;
    }
    const entry = pending.get(data.id);
    pending.delete(data.id);
    if (pending.size === 0) stop.disabled = true;
    if (entry) renderResult(entry, data);
  };
}

function evaluate(text) {
  if (!text.trim() || run.disabled) return;
  const id = nextId++;
  const entry = document.createElement('li');
  const code = document.createElement('pre');
  code.className = 'input';
  code.textContent = text;
  const out = document.createElement('div');
  out.className = 'output pending';
  out.textContent = '…';
  entry.append(code, out);
  history.prepend(entry);
  pending.set(id, entry);
  stop.disabled = false;
  worker.postMessage({ id, input: text });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  evaluate(input.value);
});
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    evaluate(input.value);
  }
});
stop.addEventListener('click', () => startWorker(versionSelect.value));
versionSelect.addEventListener('change', () => {
  updateSnippet(versionSelect.value);
  startWorker(versionSelect.value);
});

for (const example of EXAMPLES) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = example;
  b.addEventListener('click', () => {
    input.value = example;
    evaluate(example);
  });
  $('examples').append(b);
}

function updateSnippet(version) {
  // `new URL` would percent-encode the placeholder "<version>"
  const base = `${new URL('.', location.href).href}${version}/src/index.mjs`;
  $('snippet').textContent =
`<script type="module">
  import { loadGiac } from '${base}';
  const giac = await loadGiac();
  console.log(giac.eval('factor(x^4-1)'));
</script>`;
}

const { latest, versions } = await fetch('versions.json').then((r) => r.json());
if (!latest) {
  setStatus('No release yet');
  $('notice').hidden = false;
  versionSelect.disabled = true;
  updateSnippet('<version>');
} else {
  for (const v of versions) {
    const option = document.createElement('option');
    option.value = v;
    option.textContent = v === latest ? `${v} (latest)` : v;
    versionSelect.append(option);
  }
  versionSelect.value = latest;
  updateSnippet(latest);
  startWorker(latest);
}
