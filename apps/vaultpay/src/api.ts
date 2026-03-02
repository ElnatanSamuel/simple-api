import {
  createApi,
  createLoggerMiddleware,
  createTransformerMiddleware,
  createRetryMiddleware,
} from "@simple-api/core";
import { createReactAdapter } from "@simple-api/react";
import { createZustandMiddleware } from "@simple-api/zustand";

// 1. Define Services
const authService = {
  login: { method: "POST", path: "/auth/login" as const },
  me: { method: "GET", path: "/auth/me" as const },
};

const accountService = {
  list: { method: "GET", path: "/accounts" as const },
};

const transactionService = {
  list: { method: "GET", path: "/transactions" as const },
  send: { method: "POST", path: "/transactions" as const },
};

// 2. Initialize Core API with Middleware
export const api = createApi({
  baseUrl: "https://api.vaultpay.io",
  middleware: [
    createLoggerMiddleware(),
    createTransformerMiddleware(), // snake_case <-> camelCase
    createRetryMiddleware({ maxRetries: 2 }), // Auto-retry on failure
    // Zustand Sync Middleware (MOCK)
    createZustandMiddleware({
      auth: {
        setState: (data: any) => console.log("Syncing Auth Store:", data),
      },
    }),
  ],
  services: {
    auth: {
      middleware: [
        async ({ options }, next) => {
          const token = "MOCK_TOKEN"; // In reality, get from store
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          };
          return next(options);
        },
      ],
      endpoints: authService,
    },
    accounts: accountService,
    transactions: transactionService,
  },
});

// 3. Create React Hooks
export const useVaultApi = createReactAdapter(api);
