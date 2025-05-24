/// <reference lib="webworker" />

// Define service worker events
interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}

interface FetchEvent extends ExtendableEvent {
  request: Request;
  respondWith(response: Response | Promise<Response>): void;
}

// Define Cache interface
interface Cache {
  put(request: Request | string, response: Response): Promise<void>;
  match(request: Request | string): Promise<Response | undefined>;
  delete(request: Request | string): Promise<boolean>;
  keys(): Promise<readonly Request[]>;
}

// Define CacheStorage interface
interface CacheStorage {
  open(cacheName: string): Promise<Cache>;
  delete(cacheName: string): Promise<boolean>;
  keys(): Promise<readonly string[]>;
}

// Define ServiceWorkerGlobalScopeEventMap
interface ServiceWorkerGlobalScopeEventMap {
  'fetch': FetchEvent;
  'install': ExtendableEvent;
  'activate': ExtendableEvent;
}

// Define ServiceWorkerGlobalScope
interface ServiceWorkerGlobalScope extends WorkerGlobalScope {
  caches: CacheStorage;
  oninstall: ((this: ServiceWorkerGlobalScope, ev: ExtendableEvent) => any) | null;
  onfetch: ((this: ServiceWorkerGlobalScope, ev: FetchEvent) => any) | null;
  onactivate: ((this: ServiceWorkerGlobalScope, ev: ExtendableEvent) => any) | null;
  addEventListener<K extends keyof ServiceWorkerGlobalScopeEventMap>(
    type: K,
    listener: (this: ServiceWorkerGlobalScope, ev: ServiceWorkerGlobalScopeEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
}

declare const self: ServiceWorkerGlobalScope;
