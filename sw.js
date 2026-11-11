// Tiene in memoria l'app sul telefono, così parte anche senza rete.
// Con la connessione scarica sempre la pagina più recente; senza, usa la copia salvata.
// Quando cambi un file dell'app, aumenta il numero di versione qui sotto.
const VERSIONE = "accoglienza-v3";
const FILE = ["./", "index.html", "manifest.webmanifest", "logo.png",
  "icona-180.png", "icona-192.png", "icona-512.png",
  "xlsx.full.min.js", "aes.js", "sha512.min.js"];

self.addEventListener("install", e => {
  // cache: "reload" salta la cache del browser, così non salva copie vecchie
  e.waitUntil(caches.open(VERSIONE)
    .then(c => c.addAll(FILE.map(u => new Request(u, {cache: "reload"}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n !== VERSIONE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const pagina = req.mode === "navigate" || req.destination === "document";
  if (pagina) {
    // prima la rete, poi la copia salvata
    e.respondWith(
      fetch(req, {cache: "no-cache"}).then(r => {
        const copia = r.clone();
        caches.open(VERSIONE).then(c => c.put("index.html", copia)).catch(() => {});
        return r;
      }).catch(() => caches.match("index.html"))
    );
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(r => r || fetch(req)));
});
