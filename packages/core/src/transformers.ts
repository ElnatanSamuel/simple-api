import { Middleware } from "./index";

/**
 * Utility to convert keys between camelCase and snake_case.
 * Simplified version for implementation demo.
 */
const transformKeys = (obj: any, transformer: (s: string) => string): any => {
  if (Array.isArray(obj)) return obj.map((v) => transformKeys(v, transformer));
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const transformedKey = transformer(key);
      acc[transformedKey] = transformKeys(obj[key], transformer);
      return acc;
    }, {} as any);
  }
  return obj;
};

const toSnake = (s: string) =>
  s.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
const toCamel = (s: string) => s.replace(/(_\w)/g, (m) => m[1].toUpperCase());

export const createTransformerMiddleware = (): Middleware => {
  return async ({ options }, next) => {
    // 1. Transform request body to snake_case
    if (options.body) {
      options.body = transformKeys(options.body, toSnake);
    }

    const response = await next(options);

    // 2. Transform response to camelCase
    return transformKeys(response, toCamel);
  };
};
