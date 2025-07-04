declare namespace ServiceWorkerGlobalScope {
  interface EventMap {
    'fetch': FetchEvent;
    'install': ExtendableEvent;
    'activate': ExtendableEvent;
  }
}

interface ServiceWorkerGlobalScope extends WorkerGlobalScope {
  caches: CacheStorage;
  oninstall: ((this: ServiceWorkerGlobalScope, ev: ExtendableEvent) => void) | null;
  onfetch: ((this: ServiceWorkerGlobalScope, ev: FetchEvent) => Response | Promise<Response>) | null;
  onactivate: ((this: ServiceWorkerGlobalScope, ev: ExtendableEvent) => void) | null;
  addEventListener(
    type: keyof ServiceWorkerGlobalScope['EventMap'],
    listener: (this: ServiceWorkerGlobalScope, event: Event) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
}
