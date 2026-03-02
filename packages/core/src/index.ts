export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

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

/**
 * The core API factory that generates a structured engine from service definitions.
 */
export function createApi<
  T extends Record<string, Record<string, EndpointConfig>>,
>(config: { baseUrl: string; middleware?: Middleware[]; services: T }) {
  const rootMiddleware = config.middleware || [];
  const inflightRequests = new Map<string, Promise<any>>();

  return Object.entries(config.services).reduce(
    (acc, [serviceName, endpoints]) => {
      acc[serviceName] = Object.entries(endpoints).reduce(
        (eAcc, [endpointName, endpoint]) => {
          // We store the original config for adapters to use (e.g. for method checking)
          const executor = async (options: RequestOptions = {}) => {
            // ... (path param and URL logic remains same)
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

            // 4. Base Fetch Executor (with deduplication for GET)
            const execute = async (currentOptions: RequestOptions) => {
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
                    throw new Error(
                      errorBody.message ||
                        `API Error: ${response.status} ${response.statusText}`,
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

            // 5. Middleware Pipeline Execution (Global -> Endpoint)
            const allMiddleware = [
              ...rootMiddleware,
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
                  runner,
                );
              }
              return execute(opts);
            };

            return runner(options);
          };

          // Expose config for adapters
          (executor as any)._config = endpoint;

          eAcc[endpointName] = executor;
          return eAcc;
        },
        {} as any,
      );
      return acc;
    },
    {} as any,
  ) as any; // Type inference could be improved here for production
}

export * from "./logger";
export * from "./transformers";
export * from "./retry";
export * from "./mock";
