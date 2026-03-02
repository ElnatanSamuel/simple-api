import { Middleware } from "./index";

export interface MockResolver {
  path: string | RegExp;
  method?: string;
  response: any | ((options: any) => any);
  delay?: number;
}

export const createMockMiddleware = (resolvers: MockResolver[]): Middleware => {
  return async ({ config, options }, next) => {
    const resolver = resolvers.find((r) => {
      const pathMatch =
        typeof r.path === "string"
          ? config.path?.includes(r.path)
          : r.path.test(config.path);

      const methodMatch = !r.method || r.method === config.method;

      return pathMatch && methodMatch;
    });

    if (resolver) {
      if (resolver.delay) {
        await new Promise((resolve) => setTimeout(resolve, resolver.delay));
      }

      console.info(`[Mock] Intercepted ${config.path} with mock response.`);
      return typeof resolver.response === "function"
        ? resolver.response(options)
        : resolver.response;
    }

    return next(options);
  };
};
