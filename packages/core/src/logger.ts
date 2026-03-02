import { Middleware } from "./index";

/**
 * A beautiful logger middleware that provides visibility into the API engine's execution.
 * Useful for debugging "shit" in development.
 */
export const createLoggerMiddleware = (): Middleware => {
  return async ({ service, endpoint, options }, next) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    console.group(`🚀 API REQUEST [${requestId}]: ${service}.${endpoint}`);
    console.log(
      "%cMethod:",
      "color: #3b82f6; font-weight: bold;",
      options.method || "GET",
    );
    console.log("%cOptions:", "color: #6366f1;", options);
    console.groupEnd();

    try {
      const response = await next(options);
      const duration = Date.now() - start;

      console.group(
        `✅ API SUCCESS [${requestId}]: ${service}.${endpoint} (${duration}ms)`,
      );
      console.log("%cResponse:", "color: #10b981;", response);
      console.groupEnd();

      return response;
    } catch (error: any) {
      const duration = Date.now() - start;

      console.group(
        `❌ API ERROR [${requestId}]: ${service}.${endpoint} (${duration}ms)`,
      );
      console.log(
        "%cError:",
        "color: #ef4444; font-weight: bold;",
        error.message,
      );
      console.groupEnd();

      throw error;
    }
  };
};
