import { Middleware } from "./index";

/**
 * A beautiful logger middleware that provides visibility into the API engine's execution.
 * Useful for debugging "shit" in development.
 */
export const createLoggerMiddleware = (): Middleware => {
  return async ({ service, endpoint, options, config }, next) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    console.group(`🚀 API REQUEST [${requestId}]: ${service}.${endpoint}`);
    console.log(
      "%cMethod:",
      "color: #3b82f6; font-weight: bold;",
      config.method,
    );
    console.log("%cURL:", "color: #3b82f6;", config.path);
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

      if (error.name === "ApiError") {
        console.log(
          "%cStatus:",
          "color: #ef4444; font-weight: bold;",
          error.status,
          error.statusText,
        );
        console.log("%cError Body:", "color: #f87171;", error.data);
      } else {
        console.log(
          "%cMessage:",
          "color: #ef4444; font-weight: bold;",
          error.message,
        );
        console.log("%cFull Error:", "color: #f87171;", error);
      }

      console.groupEnd();

      throw error;
    }
  };
};
