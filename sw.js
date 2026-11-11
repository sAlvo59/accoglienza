// Tiene in memoria l'app sul telefono, così parte anche senza rete.
// Quando cambi un file dell'app, aumenta il numero di versione qui sotto.
const VERSIONE = "accoglienza-v2";
const FILE = ["./", "index.html", "manifest.webmanifest", "logo.png",
  "icona-180.png", "icona-192.png", "icona-512.png",
  "xlsx.full.min.js", "aes.js", "sha512.min.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== VERSIONE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(r => r ||
      fetch(e.request).catch(() => e.request.mode === "navigate" ? caches.match("index.html") : undefined))
  );
});
