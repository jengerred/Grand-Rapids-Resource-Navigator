export interface ChatRequest {
  message: string;
  isSpanish: boolean;
}

export interface ChatResponse {
  response: string;
  error?: string;
}

export interface RateLimitConfig {
  limit: number;
  lastRequest: number;
}

export interface ResponseCache {
  get(key: string): string | undefined;
  set(key: string, value: string): this;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
}

export interface ErrorResponse extends ChatResponse {
  error: string;
  details?: string;
}
