// Giac in a Web Worker: an evaluation does not block the page, and the page
// can stop one that runs too long by terminating the worker.
//
// The version comes from the worker's URL (worker.mjs?v=200.100.0); only a
// version folder name is accepted.

const requested = new URL(self.location.href).searchParams.get('v') ?? 'latest';
const version = /^(latest|\d+\.\d+\.\d+)$/.test(requested) ? requested : 'latest';

const ready = import(`./${version}/src/index.mjs`)
  .then(({ loadGiac }) => loadGiac())
  .then((giac) => {
    postMessage({ type: 'ready', version: giac.version, package: version });
    return giac;
  })
  .catch((e) => {
    postMessage({ type: 'fatal', error: String(e) });
    throw e;
  });

onmessage = async (event) => {
  const { id, input } = event.data;
  const giac = await ready;
  try {
    const { result, messages } = giac.evalWithMessages(input);
    postMessage({ type: 'result', id, result, messages });
  } catch (e) {
    postMessage({ type: 'error', id, error: e.message, messages: e.messages ?? [] });
  }
};
