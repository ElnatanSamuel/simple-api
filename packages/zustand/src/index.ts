import { Middleware } from "@simple-api/core";

/**
 * Middleware to pipe API responses directly into Zustand stores.
 * @param stores A map of store keys to store instances (e.g. useAuthStore)
 */
export const createZustandMiddleware = (
  stores: Record<string, any>,
): Middleware => {
  return async ({ options }, next) => {
    const response = await next(options);

    // Check if storeKey is provided in request options
    if (options.storeKey && stores[options.storeKey]) {
      const store = stores[options.storeKey];

      if (options.storeSetter) {
        // Custom setter logic
        options.storeSetter(store, response);
      } else {
        // Default assumption: store has a .setState() or .set() method
        if (typeof store.setState === "function") {
          store.setState(response);
        } else if (typeof store.set === "function") {
          store.set(response);
        }
      }
    }

    return response;
  };
};
