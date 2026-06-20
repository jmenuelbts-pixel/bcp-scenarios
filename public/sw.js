// sw.js - service worker minimal.
// Strategie : reseau d'abord. A chaque requete on tente le reseau (donc la
// derniere version deployee), et on ne sert le cache qu'en secours hors ligne.
// Combine a skipWaiting + clients.claim, l'app installee recupere
// automatiquement la nouvelle version a la prochaine ouverture.

const CACHE = 'mcvb-cache-v1'

self.addEventListener('message', (event) => {
  if (event.data === 'skip') self.skipWaiting()
})

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const noms = await caches.keys()
      await Promise.all(noms.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  event.respondWith(
    (async () => {
      try {
        const reseau = await fetch(req)
        const cache = await caches.open(CACHE)
        cache.put(req, reseau.clone())
        return reseau
      } catch {
        const cache = await caches.open(CACHE)
        const enCache = await cache.match(req)
        if (enCache) return enCache
        // Repli pour la navigation hors ligne.
        if (req.mode === 'navigate') {
          const index = await cache.match('/index.html')
          if (index) return index
        }
        throw new Error('Hors ligne et non mis en cache')
      }
    })()
  )
})
