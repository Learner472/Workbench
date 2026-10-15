// Workbench service worker: offline shell + reminder notifications
const V = "wb-v1", SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== "wb-data").map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.includes("/api/")) return;
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(l => l.length ? l[0].focus() : clients.openWindow("./")));
});
// Best-effort background check (installed Chrome/Android app); the page keeps due.json up to date
async function dueCheck() {
  const dc = await caches.open("wb-data"), r = await dc.match("due.json"); if (!r) return;
  const { items } = await r.json(), t = new Date();
  const ds = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  const nr = await dc.match("notified.json"); let n = nr ? await nr.json() : { d: "", ids: [] };
  if (n.d !== ds) n = { d: ds, ids: [] };
  const fresh = items.filter(i => i.date <= ds && !n.ids.includes(i.id)); if (!fresh.length) return;
  await self.registration.showNotification(fresh.length === 1 ? fresh[0].title : `${fresh.length} items need attention`,
    { body: fresh.slice(0, 4).map(i => i.title).join(", "), tag: "wb-due", icon: "icon-192.png", badge: "icon-192.png" });
  n.ids.push(...fresh.map(i => i.id)); await dc.put("notified.json", new Response(JSON.stringify(n)));
}
self.addEventListener("periodicsync", e => { if (e.tag === "wb-due") e.waitUntil(dueCheck()); });
