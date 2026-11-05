/* Service worker do painel da equipe: deixa o app instalável, abre mesmo sem internet
   (mostrando "SEM CONEXÃO") e já trata notificações push (envio vem em etapa própria). */
const V = 'sr-v1'
// Na instalação guarda a página e os arquivos dela, para o painel abrir mesmo sem internet.
self.addEventListener('install', e => e.waitUntil((async () => {
  const c = await caches.open(V)
  try {
    const home = await fetch(self.registration.scope, { cache: 'reload' }); const html = await home.clone().text()
    await c.put(self.registration.scope, home)
    const arquivos = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => new URL(m[1], self.registration.scope).href).filter(u => u.startsWith(self.registration.scope))
    await Promise.all([...new Set(arquivos)].map(u => c.add(u).catch(() => { /* um arquivo ausente não impede a instalação */ })))
  } catch { /* sem rede na instalação: o cache se forma ao navegar */ }
  await self.skipWaiting()
})()))
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== V) await caches.delete(k)
  await self.clients.claim()
})()))

self.addEventListener('fetch', e => {
  const r = e.request; const u = new URL(r.url)
  if (r.method !== 'GET' || u.origin !== location.origin) return          // banco e API: sempre direto, nunca em cache
  if (r.mode === 'navigate') {                                              // página: rede primeiro, cópia se estiver sem internet
    e.respondWith((async () => { try { const n = await fetch(r); (await caches.open(V)).put(r, n.clone()); return n } catch { return (await caches.match(r, { ignoreSearch: true, ignoreVary: true })) || (await caches.match(self.registration.scope, { ignoreVary: true })) || Response.error() } })())
  } else if (u.pathname.includes('/assets/') || u.pathname.includes('/icons/') || u.pathname.includes('/media/')) {   // arquivos com hash: cache primeiro
    e.respondWith((async () => { const c = await caches.match(r, { ignoreVary: true }); if (c) return c; const n = await fetch(r); (await caches.open(V)).put(r, n.clone()); return n })())
  }
})

self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {} } catch { /* corpo inválido */ }
  e.waitUntil(self.registration.showNotification(d.title || 'Chamado na mesa', {
    body: d.body || 'Há um chamado aguardando a equipe.', tag: d.tag || 'chamado', renotify: true, requireInteraction: true,
    vibrate: [300, 150, 300, 150, 300], icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { url: d.url || self.registration.scope },
  }))
})
self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil((async () => {
    const todos = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const c of todos) if ('focus' in c) { await c.focus(); return }
    await self.clients.openWindow((e.notification.data && e.notification.data.url) || self.registration.scope)
  })())
})
