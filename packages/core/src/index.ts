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
  storeKey?: string; // For Zustand integration
  storeSetter?: (store: any, data: any) => void;
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
  services: T;
}): ApiEngine<T> {
  const rootMiddleware = config.middleware || [];
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
                try {
                  const response = await fetch(url.toString(), {
                    ...currentOptions,
                    method: endpoint.method,
                    body: currentOptions.body
                      ? JSON.stringify(currentOptions.body)
                      : undefined,
                    headers: {
                      "Content-Type": "application/json",
                      ...currentOptions.headers,
                    },
                  });

                  if (!response.ok) {
                    const errorBody = await response.json().catch(() => ({}));
                    throw new ApiError(
                      response.status,
                      response.statusText,
                      errorBody,
                    );
                  }

                  return await response.json();
                } finally {
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
