/// <reference lib="webworker" />

interface ExtendableEvent extends Event {
  readonly clientId: string | null;
  readonly handled: boolean;
  readonly preloadResponse: Promise<Response> | null;
  readonly request: Request;
  waitUntil(promise: Promise<any>): void;
}

interface FetchEvent extends ExtendableEvent {
  readonly request: Request;
  readonly target: ServiceWorkerGlobalScope;
  readonly type: 'fetch';
  respondWith(response: Response | Promise<Response>): void;
}

interface Cache {
  put(request: Request | string, response: Response): Promise<void>;
  match(request: Request | string): Promise<Response | undefined>;
  delete(request: Request | string): Promise<boolean>;
  keys(): Promise<readonly Request[]>;
}

interface CacheStorage {
  open(cacheName: string): Promise<Cache>;
  delete(cacheName: string): Promise<boolean>;
  keys(): Promise<readonly string[]>;
}

interface ServiceWorkerGlobalScopeEventMap {
  'fetch': FetchEvent;
  'install': ExtendableEvent;
  'activate': ExtendableEvent;
}

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


