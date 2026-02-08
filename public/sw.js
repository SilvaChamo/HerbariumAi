const CACHE_NAME = 'herbarium-ai-v1';
const STATIC_CACHE = 'herbarium-static-v1';
const DATA_CACHE = 'herbarium-data-v1';

// Arquivos estáticos para cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('SW: Installing');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  console.log('SW: Activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia para API calls
  if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Estratégia para assets estáticos
  if (STATIC_ASSETS.some(asset => url.pathname.includes(asset))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Para outras requisições, tentar rede primeiro
  event.respondWith(networkFirst(request));
});

// Network First Strategy (para dados dinâmicos)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache da resposta bem-sucedida
    if (networkResponse.ok) {
      const cache = await caches.open(DATA_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('SW: Network failed, trying cache');
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline - No cached data available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Cache First Strategy (para assets estáticos)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    return new Response('Offline - Asset not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Background sync para operações offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Sincronização de dados offline
async function syncOfflineData() {
  try {
    const offlineQueue = await getOfflineQueue();

    for (const operation of offlineQueue) {
      try {
        await fetch(operation.url, {
          method: operation.method,
          headers: operation.headers,
          body: operation.body
        });

        // Remove operação da fila após sucesso
        await removeFromQueue(operation.id);
      } catch (error) {
        console.error('Sync failed for operation:', operation, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Funções auxiliares para fila offline
async function getOfflineQueue() {
  // Implementar com IndexedDB
  return [];
}

async function removeFromQueue(operationId) {
  // Implementar com IndexedDB
}
