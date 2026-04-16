self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isPotentialStream = url.pathname.includes("/chat/completions");
  if (isPotentialStream) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  event.respondWith(
    fetch(request).catch(() => {
      if (request.mode === "navigate") {
        return new Response(
          "<!doctype html><html><head><meta charset='utf-8'><title>Offline</title></head><body><h1>Offline mode</h1><p>Сеть недоступна. Проверьте интернет и повторите попытку.</p></body></html>",
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
      return Response.error();
    })
  );
});
