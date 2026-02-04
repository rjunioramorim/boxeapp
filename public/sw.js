// Service Worker básico para PWA
// Focado apenas em instalação; não implementa cache agressivo nem lógica complexa de offline.

self.addEventListener("install", (event) => {
  // Garantir que o service worker seja ativado rapidamente em atualizações
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Limpeza futura de caches poderia ser feita aqui se necessário
  event.waitUntil(self.clients.claim());
});

// Intercepta navegações apenas para permitir futura personalização de offline.
// Por enquanto, tudo segue para a rede normalmente.
self.addEventListener("fetch", () => {
  // Intencionalmente vazio: deixa o browser seguir o fluxo padrão (online).
});

