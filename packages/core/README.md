# @simple-api/core 🚀

**The high-performance, framework-agnostic engine powering simple-api.**

`@simple-api/core` is a production-grade API client builder designed for high-scale TypeScript applications. It provides a service-oriented architecture, built-in request deduplication, a powerful middleware system, and automatic parameter injection.

## ✨ Key Features

- **🚀 Performance**: Automatic request deduplication prevents redundant network calls.
- **🏗️ Architecture**: Organizes endpoints into logical services.
- **🛡️ Resilience**: Tiered middleware system for retries, logging, and transformations.
- **💎 Type Safety**: End-to-end TypeScript inference for parameters, query strings, and response bodies.
- **🌐 Universal**: Runs in Node.js, Browsers, and React Native with zero dependencies.

## 📦 Installation

```bash
npm install @simple-api/core
# or
yarn add @simple-api/core
# or
pnpm add @simple-api/core
```

## 🚀 Quick Start

### 1. Define your API structure

```typescript
import { createApi } from "@simple-api/core";

export const api = createApi({
  baseUrl: "https://api.example.com",
  services: {
    users: {
      get: { method: "GET", path: "/users/:id" },
      list: { method: "GET", path: "/users" },
      update: { method: "PATCH", path: "/users/:id" },
    },
    auth: {
      login: { method: "POST", path: "/auth/login" },
    },
  },
});
```

### 2. Make calls

```typescript
// Path parameters are automatically handled
const user = await api.users.get({ params: { id: "123" } });

// Query parameters are serialized
const activeUsers = await api.users.list({ query: { status: "active" } });

// Request body is type-safe
await api.auth.login({ body: { email, password } });
```

## 🛠 Middleware System

SimpleAPI uses a "Koa-style" middleware system that allows you to intercept and modify requests and responses.

### Using Built-in Middlewares

```typescript
import {
  createLoggerMiddleware,
  createTransformerMiddleware,
  createRetryMiddleware
} from "@simple-api/core";

const api = createApi({
  baseUrl: "...",
  middleware: [
    createLoggerMiddleware(),
    // Convert camelCase (JS) to snake_case (API)
    createTransformerMiddleware({ request: "snake_case", response: "camelCase" }),
    createRetryMiddleware({ maxRetries: 3 }),
  ],
  services: { ... },
});
```

### Service-Level Middleware

You can also apply middleware to all endpoints within a specific service:

```typescript
const api = createApi({
  baseUrl: "...",
  services: {
    auth: {
      middleware: [authGuardMiddleware],
      endpoints: {
        profile: { method: "GET", path: "/me" },
        settings: { method: "PATCH", path: "/settings" },
      },
    },
    public: {
      // Direct record of endpoints also still works!
      search: { method: "GET", path: "/search" },
    },
  },
});
```

The execution order is always: **Global -> Service -> Endpoint**.

### Writing Custom Middleware

```typescript
const myMiddleware = async ({ service, endpoint, options }, next) => {
  console.log(`Calling ${service}.${endpoint}`);

  // Modify options before request
  options.headers = { ...options.headers, "X-Custom": "val" };

  const response = await next(options);

  // Modify response after request
  return response;
};
```

## 🧠 Advanced Concepts

### Request Deduplication

By default, all `GET` requests are deduplicated. If you trigger the same request (same path, params, and query) while one is already in flight, the engine will return the same promise for both, saving network bandwidth.

### Path Parameter Injection

Path parameters like `:id` in `/users/:id` are automatically replaced by the values provided in `params`. If a parameter is missing, it throws a compile-time and runtime error.

## 📄 License

MIT © Elnatan Samuel
