const CACHE_NAME = "dd8f737";
const urlsToCache = [
    "/css/interactive-8244c80.css",
    "/js/bugsnag-f0c206ee.js",
    "/js/extra-4bfde388.js",
    "/js/orbital-b717169f.js",
    "/js/required-558b88c3.js",
    "/JSON/properties-90d5338.json",
    "/icon/pt-square-192.png",
    "/icon/pt-square-192.png"
];

self.addEventListener("install", e => {
    // First event, comes from pwa.js via .register
    e.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
        .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", e => {
    // Called by skipWaiting (or a page reload?)
    const cacheWhitelist = [CACHE_NAME];
    let had_to_purge = 0;

    e.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        had_to_purge++;
                        return caches.delete(cacheName);
                    }
                })
                // Triggers pwa.js's controllerchange event.
            ).then(() => {
                //				if (had_to_purge)
                //					self.clients.claim();
            })
        )
    );
});

self.addEventListener("fetch", e => {
    e.respondWith(caches.match(e.request)
        .then(response => {
            if (response)
                // Exact match in cache
                return response;

            const url = new URL(e.request.url);

            if (url.pathname.startsWith("/JSON/isotope/")) {
                const atomic = e.request.url.split("/").pop().split(".")[0];
                return caches.match("/JSON/isotope/all.json").then(response => {
                    if (response)
                        return response.json()
                            .then(all_isotopes => new Response(JSON.stringify(all_isotopes[atomic])));

                    // isotopes/all not in cache, get from network
                    return fetch(e.request)
                        .catch(err => console.log("All isotopes weren't saved, and failed to get from network.", e.request));
                });
            }

            if (url.pathname.startsWith("/JSON/compounds/")) {
                const formula_url = e.request.url.split("/").pop();
                const formula_offset = formula_url.split("_");
                if (formula_offset[1])
                    return fetch(e.request)
                        .catch(err => console.log("Offset requests aren't cached, and failed to get from network.", e.request));
                const formula = formula_offset[0] === "DEFAULT" ? "DEFAULT" : formula_offset[0].split("=")[1];
                return caches.match("/JSON/compounds.json").then(response => {
                    if (response)
                        return response.json()
                            .then(all_compounds => new Response(JSON.stringify(all_compounds[formula] || {})));

                    // compounds.json not in cache, get from network
                    return fetch(e.request)
                        .catch(err => console.log("Compound blob wasn't saved, and failed to get individual from network.", e.request));
                });
            }

            // Not in cache, get from network
            return fetch(e.request)
                .catch(err => console.log("Not in cache and failed to get from network: ", e.request.url));
        })
    );
});