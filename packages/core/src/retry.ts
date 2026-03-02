import { Middleware, RequestOptions } from "./index";

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

export const createRetryMiddleware = (
  config: RetryOptions = {},
): Middleware => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    shouldRetry = (err) =>
      err.message.includes("API Error") || err.name === "TypeError",
  } = config;

  return async ({ options }, next) => {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await next(options);
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries || !shouldRetry(error)) {
          throw error;
        }

        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(
          `[Retry] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  };
};
