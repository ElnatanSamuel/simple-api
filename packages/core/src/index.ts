export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: any,
  ) {
    super(data?.message || `API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number>;
  query?: Record<string, any>;
  body?: any;
  baseUrl?: string;
  headers?: Record<string, string>;
  timeout?: number; // Auto-abort after N milliseconds
  pollingInterval?: number; // Re-fetch every N milliseconds
  upload?: boolean; // Automatically convert body to FormData
  storeKey?: string; // For Zustand integration
  storeSetter?: (store: any, data: any) => void;
}

/**
 * Interceptors allow global request/response/error hooks without
 * sitting in the middleware pipeline. Attach them to createApi config.
 */
export interface ApiInterceptors {
  onRequest?: (
    context: MiddlewareContext,
  ) => RequestOptions | void | Promise<RequestOptions | void>;
  onResponse?: (data: any, context: MiddlewareContext) => any | Promise<any>;
  onError?: (error: Error, context: MiddlewareContext) => void | Promise<void>;
}

export interface EndpointConfig {
  method: HttpMethod;
  path: string;
  baseUrl?: string;
  middleware?: Middleware[];
}

export type MiddlewareContext = {
  service: string;
  endpoint: string;
  config: EndpointConfig;
  options: RequestOptions;
};

export type Middleware = (
  context: MiddlewareContext,
  next: (options: RequestOptions) => Promise<any>,
) => Promise<any>;

export interface ServiceConfig {
  endpoints: Record<string, EndpointConfig>;
  middleware?: Middleware[];
}

export type ServiceEndpoints = Record<string, EndpointConfig>;

export type ApiEngine<T> = {
  [K in keyof T]: T[K] extends ServiceConfig
    ? {
        [E in keyof T[K]["endpoints"]]: (
          options?: RequestOptions,
        ) => Promise<any>;
      }
    : T[K] extends ServiceEndpoints
      ? {
          [E in keyof T[K]]: (options?: RequestOptions) => Promise<any>;
        }
      : never;
};

/**
 * The core API factory that generates a structured engine from service definitions.
 */
export function createApi<
  T extends Record<string, ServiceEndpoints | ServiceConfig>,
>(config: {
  baseUrl: string;
  middleware?: Middleware[];
  interceptors?: ApiInterceptors;
  services: T;
}): ApiEngine<T> {
  const rootMiddleware = config.middleware || [];
  const interceptors = config.interceptors || {};
  const inflightRequests = new Map<string, Promise<any>>();

  return Object.entries(config.services).reduce(
    (acc, [serviceName, serviceConfig]) => {
      const isServiceConfig =
        "endpoints" in serviceConfig && !!(serviceConfig as any).endpoints;

      const endpoints = isServiceConfig
        ? (serviceConfig as ServiceConfig).endpoints
        : (serviceConfig as ServiceEndpoints);

      const serviceMiddleware = isServiceConfig
        ? (serviceConfig as ServiceConfig).middleware || []
        : [];

      acc[serviceName] = Object.entries(endpoints).reduce(
        (eAcc, [endpointName, endpoint]) => {
          const executor = async (options: RequestOptions = {}) => {
            let path = endpoint.path;
            if (options.params) {
              Object.entries(options.params).forEach(([key, value]) => {
                path = path.replace(`:${key}`, String(value));
              });
            }

            const base = options.baseUrl || endpoint.baseUrl || config.baseUrl;
            const url = new URL(path, base);

            if (options.query) {
              Object.entries(options.query).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                  url.searchParams.append(key, String(value));
                }
              });
            }

            const requestKey = `${endpoint.method}:${url.toString()}:${JSON.stringify(options.body)}`;

            const execute = async (currentOptions: RequestOptions = {}) => {
              if (endpoint.method === "GET") {
                const existing = inflightRequests.get(requestKey);
                if (existing) return existing;
              }

              const fetchPromise = (async () => {
                // Run onRequest interceptor
                const ctx: MiddlewareContext = {
                  service: serviceName,
                  endpoint: endpointName,
                  config: endpoint,
                  options: currentOptions,
                };
                if (interceptors.onRequest) {
                  const modified = await interceptors.onRequest(ctx);
                  if (modified) currentOptions = modified;
                }

                // Build AbortController for timeout support
                const controller = new AbortController();
                const timeoutMs = currentOptions.timeout;
                let timeoutId: ReturnType<typeof setTimeout> | undefined;
                if (timeoutMs) {
                  timeoutId = setTimeout(
                    () =>
                      controller.abort(
                        `Request timed out after ${timeoutMs}ms`,
                      ),
                    timeoutMs,
                  );
                }

                try {
                  let body: any = currentOptions.body;
                  let headers: Record<string, string> = {
                    "Content-Type": "application/json",
                    ...currentOptions.headers,
                  };

                  if (
                    currentOptions.upload &&
                    body &&
                    typeof body === "object"
                  ) {
                    const formData = new FormData();
                    Object.entries(body).forEach(([key, value]) => {
                      if (value instanceof FileList) {
                        Array.from(value).forEach((file) =>
                          formData.append(key, file),
                        );
                      } else if (
                        value instanceof File ||
                        value instanceof Blob
                      ) {
                        formData.append(key, value);
                      } else {
                        formData.append(key, String(value));
                      }
                    });
                    body = formData;
                    // Delete Content-Type to let the browser set it with boundary
                    delete headers["Content-Type"];
                  } else if (body) {
                    body = JSON.stringify(body);
                  }

                  const response = await fetch(url.toString(), {
                    ...currentOptions,
                    signal: currentOptions.signal ?? controller.signal,
                    method: endpoint.method,
                    body,
                    headers,
                  });

                  if (!response.ok) {
                    const errorBody = await response.json().catch(() => ({}));
                    const err = new ApiError(
                      response.status,
                      response.statusText,
                      errorBody,
                    );
                    if (interceptors.onError)
                      await interceptors.onError(err, ctx);
                    throw err;
                  }

                  let data = await response.json();
                  if (interceptors.onResponse)
                    data = (await interceptors.onResponse(data, ctx)) ?? data;

                  // Handle Polling
                  if (currentOptions.pollingInterval) {
                    setTimeout(
                      () => executor(currentOptions),
                      currentOptions.pollingInterval,
                    );
                  }

                  return data;
                } catch (err: any) {
                  if (interceptors.onError && !(err instanceof ApiError)) {
                    await interceptors.onError(err, ctx);
                  }
                  throw err;
                } finally {
                  if (timeoutId) clearTimeout(timeoutId);
                  if (endpoint.method === "GET") {
                    inflightRequests.delete(requestKey);
                  }
                }
              })();

              if (endpoint.method === "GET") {
                inflightRequests.set(requestKey, fetchPromise);
              }

              return fetchPromise;
            };

            // Pipeline: Global -> Service -> Endpoint
            const allMiddleware = [
              ...rootMiddleware,
              ...serviceMiddleware,
              ...(endpoint.middleware || []),
            ];

            let index = 0;
            const runner = async (opts: RequestOptions): Promise<any> => {
              if (index < allMiddleware.length) {
                const mw = allMiddleware[index++];
                return mw(
                  {
                    service: serviceName,
                    endpoint: endpointName,
                    config: endpoint,
                    options: opts,
                  },
                  getRunnerWithFallback(runner, opts),
                );
              }
              return execute(opts);
            };

            return runner(options);
          };

          (executor as any)._config = endpoint;
          eAcc[endpointName] = executor;
          return eAcc;
        },
        {} as any,
      );
      return acc;
    },
    {} as any,
  ) as ApiEngine<T>;
}

// Helper to ensure next is called with newest options but maintains runner state
function getRunnerWithFallback(
  runner: (opts: RequestOptions) => Promise<any>,
  initialOpts: RequestOptions,
) {
  return (newOpts?: RequestOptions) => runner(newOpts || initialOpts);
}

export * from "./logger";
export * from "./transformers";
export * from "./retry";
export * from "./mock";
export * from "./pagination";
export * from "./cache";
