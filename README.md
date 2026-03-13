<p align="center">
  <img src="./public/logo.png" width="300" alt="simple-api logo">
</p>

# simple-api

A production-grade, framework-agnostic API client engine for TypeScript applications.

- **Website**: [simple-api.dev](https://simpleapidocs.vercel.app/)
- **GitHub**: [github.com/elnatansamuel/simple-api](https://github.com/elnatansamuel/simple-api)
- **npm**: [@simple-api/core](https://www.npmjs.com/package/@simple-api/core)
- **Author**: Elnatan Samuel — [elnatansamuel25@gmail.com](mailto:elnatansamuel25@gmail.com)

---

## Overview

simple-api is a centralized, type-safe API engine built to handle every aspect of your application's network layer. It abstracts away the boilerplate of the native fetch API — manual response checking, error parsing, parameter injection, case conversion, and retry logic — and replaces it with a clean, service-oriented definition model.

Every endpoint you define becomes a fully typed, callable function. Middleware runs in a well-defined, predictable pipeline. Errors are structured and rich with context. GET requests are automatically deduplicated. You define the shape once, and everything downstream — from hooks in React to stores in Svelte — derives from that definition.

The engine has zero dependencies. It runs in Node.js, browsers, and React Native without modification.

---

## Packages

| Package                    | Description                              | npm                                                           |
| :------------------------- | :--------------------------------------- | :------------------------------------------------------------ |
| `@simple-api/core`         | Core engine, all middleware, type system | [npm](https://www.npmjs.com/package/@simple-api/core)         |
| `@simple-api/react`        | TanStack Query v5 adapter for React      | [npm](https://www.npmjs.com/package/@simple-api/react)        |
| `@simple-api/svelte`       | TanStack Query v5 adapter for Svelte     | [npm](https://www.npmjs.com/package/@simple-api/svelte)       |
| `@simple-api/zustand`      | Zustand store synchronization middleware | [npm](https://www.npmjs.com/package/@simple-api/zustand)      |
| `@simple-api/react-native` | Mobile-optimized React adapter           | [npm](https://www.npmjs.com/package/@simple-api/react-native) |

---

## Installation

Install the core package and any adapters relevant to your project.

```bash
# Core engine (required for all projects)
npm install @simple-api/core

# React adapter
npm install @simple-api/react @tanstack/react-query

# Svelte adapter
npm install @simple-api/svelte @tanstack/svelte-query

# Zustand store synchronization
npm install @simple-api/zustand zustand

# React Native adapter
npm install @simple-api/react-native @tanstack/react-query
```

---

## Main Features

- **Structured Errors**: The ApiError class provides status codes and full response bodies for failed requests.
- **Request Timeouts**: Built-in AbortController support for auto-aborting long-running requests.
- **Interceptors**: Global hooks for every request, response, and error.
- **PWA Caching**: Stale-While-Revalidate caching using the Web Cache API.
- **Polling**: Native support for auto-refreshing background requests.
- **File Uploads**: Automatic conversion and header management for `multipart/form-data`.
- **Pagination**: Framework-agnostic logic for page-based and cursor-based APIs.
- **Offline Queue**: Mobile-optimized durability for mutations (React Native).
- **CLI Tools**: Generate definitions from OpenAPI or export to Postman.

---

## Quick Start

### 1. Define your API

The `createApi` factory takes a `baseUrl`, an optional global `middleware` array, and a `services` object. Services group related endpoints together.

```typescript
import {
  createApi,
  createLoggerMiddleware,
  createRetryMiddleware,
  createTransformerMiddleware,
} from "@simple-api/core";

export const api = createApi({
  baseUrl: "https://api.example.com",
  middleware: [
    createLoggerMiddleware(),
    createRetryMiddleware({ maxRetries: 3 }),
    createTransformerMiddleware({
      request: "snake_case",
      response: "camelCase",
    }),
  ],
  services: {
    auth: {
      login: { method: "POST", path: "/auth/login" },
      register: { method: "POST", path: "/auth/register" },
      logout: { method: "POST", path: "/auth/logout" },
    },
    users: {
      list: { method: "GET", path: "/users" },
      get: { method: "GET", path: "/users/:id" },
      update: { method: "PATCH", path: "/users/:id" },
      remove: { method: "DELETE", path: "/users/:id" },
    },
  },
});
```

### 2. Call endpoints directly

```typescript
// Path parameters injected automatically
const user = await api.users.get({ params: { id: "42" } });

// Query string serialized automatically
const active = await api.users.list({ query: { status: "active", page: 2 } });

// Body serialized to JSON automatically
const session = await api.auth.login({
  body: { email: "user@example.com", password: "secret" },
});
```

### 3. Use with React

```tsx
import { createReactAdapter } from "@simple-api/react";
import { api } from "./api";

const useApi = createReactAdapter(api);

function Profile({ id }: { id: string }) {
  const { users } = useApi();
  const { data, isLoading, error } = users().get({ params: { id } });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;
  return <h1>{data.name}</h1>;
}

function UpdateProfile({ id }: { id: string }) {
  const { users } = useApi();
  const { execute, isPending } = users().update({
    params: { id },
    invalidates: ["users"], // Refreshes all 'users' queries on success
  });

  return (
    <button onClick={() => execute({ name: "New Name" })} disabled={isPending}>
      {isPending ? "Saving..." : "Save"}
    </button>
  );
}
```

---

## Core Concepts

### Services

Services are named groupings of endpoints. They map directly to properties on the returned engine object. Accessing `api.users.get()` means you are calling the `get` endpoint inside the `users` service.

```typescript
services: {
  users: {
    get: { method: "GET", path: "/users/:id" },
  }
}
// Usage: api.users.get({ params: { id: "1" } })
```

### Endpoint Definition

Each endpoint is an object describing the HTTP method and path.

| Property     | Type                                    | Required | Description                                            |
| :----------- | :-------------------------------------- | :------- | :----------------------------------------------------- |
| `method`     | `GET \| POST \| PUT \| PATCH \| DELETE` | Yes      | The HTTP method to use.                                |
| `path`       | `string`                                | Yes      | The URL path. Supports `:param` placeholders.          |
| `baseUrl`    | `string`                                | No       | Overrides the global `baseUrl` for this endpoint only. |
| `middleware` | `Middleware[]`                          | No       | Endpoint-specific middleware.                          |

### Request Options

When calling an endpoint, you can pass these options:

| Property          | Type                               | Description                                                                         |
| :---------------- | :--------------------------------- | :---------------------------------------------------------------------------------- |
| `params`          | `Record<string, string \| number>` | Replaces `:param` placeholders in the path.                                         |
| `query`           | `Record<string, any>`              | Appended to the URL as search parameters.                                           |
| `body`            | `any`                              | The request body. Serialized to JSON automatically.                                 |
| `headers`         | `Record<string, string>`           | Merged on top of the default `Content-Type: application/json` header.               |
| `baseUrl`         | `string`                           | Overrides the base URL for this specific call.                                      |
| `timeout`         | `number`                           | Auto-abort after N milliseconds.                                                    |
| `pollingInterval` | `number`                           | Re-fetch every N milliseconds indefinitely.                                         |
| `upload`          | `boolean`                          | Automatically converts body to `FormData` for file uploads.                         |
| `storeKey`        | `string`                           | The Zustand store key to dispatch the response to (requires `@simple-api/zustand`). |

---

## Middleware System

Middleware in simple-api follows a Koa-style `async (context, next) => ...` pattern. Each middleware in the chain must call `await next(options)` to pass control to the next middleware or to the final fetch execution.

### Middleware Signature

```typescript
type Middleware = (
  context: MiddlewareContext,
  next: (options: RequestOptions) => Promise<any>,
) => Promise<any>;

type MiddlewareContext = {
  service: string;
  endpoint: string;
  config: EndpointConfig;
  options: RequestOptions;
};
```

### Tiered Execution

Middleware can be applied at three levels. They execute in the following guaranteed order:

```
Global Middleware -> Service Middleware -> Endpoint Middleware -> fetch()
```

**Global** — Defined in `createApi({ middleware: [...] })`. Runs on every request.

**Service** — Defined inside a service config block. Runs on every request to that service only.

**Endpoint** — Defined on an individual endpoint. Runs only for that specific call.

```typescript
const api = createApi({
  middleware: [createLoggerMiddleware()], // Global: runs on everything
  services: {
    auth: {
      middleware: [inject_auth_header], // Service: runs on all auth endpoints
      endpoints: {
        profile: {
          method: "GET",
          path: "/me",
          middleware: [rate_limit_guard], // Endpoint: only on this one
        },
      },
    },
  },
});
```

### Writing Custom Middleware

```typescript
import type { Middleware } from "@simple-api/core";

// 1. Inject an Authorization header
const authMiddleware: Middleware = async ({ options }, next) => {
  const token = getToken();
  options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
  return next(options);
};

// 2. Transform the response
const timestampMiddleware: Middleware = async (ctx, next) => {
  const data = await next();
  return { ...data, fetchedAt: Date.now() };
};

// 3. Catch and handle specific errors
const errorMiddleware: Middleware = async (ctx, next) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearAuthSession();
    }
    throw error; // Always re-throw unless you intend to suppress the error
  }
};
```

---

## Built-in Middleware

### Logger — `createLoggerMiddleware()`

Outputs beautifully grouped logs for every request and response. Detects `ApiError` instances and automatically logs the status code and full error body.

```typescript
import { createLoggerMiddleware } from "@simple-api/core";

const api = createApi({
  middleware: [createLoggerMiddleware()],
  ...
});
```

Each log entry includes a unique request ID, the service and endpoint name, the HTTP method and path, and the total round-trip duration in milliseconds.

---

### Retry — `createRetryMiddleware(options)`

Retries failed requests using exponential backoff. Only retries on network failures or 5xx server errors. Does not retry 4xx client errors.

```typescript
import { createRetryMiddleware } from "@simple-api/core";

createRetryMiddleware({
  maxRetries: 3, // Maximum number of additional attempts
  baseDelay: 1000, // Initial delay in milliseconds
  maxDelay: 10000, // Maximum delay between retries
});
```

The delay formula is `Math.min(baseDelay * 2^attempt, maxDelay)`, providing a natural backoff curve.

---

### Transformer — `createTransformerMiddleware(options)`

Converts key casing in request bodies and response payloads. Handles nested objects and arrays recursively.

```typescript
import { createTransformerMiddleware } from "@simple-api/core";

createTransformerMiddleware({
  request: "snake_case", // JS camelCase -> API snake_case
  response: "camelCase", // API snake_case -> JS camelCase
});
```

This eliminates the tedious manual mapping between `user_id` (backend) and `userId` (frontend) across your entire codebase.

---

### Mock — `createMockMiddleware(definitions)`

Intercepts requests and returns predefined responses. Supports simulated latency and error responses.

```typescript
import { createMockMiddleware } from "@simple-api/core";

createMockMiddleware([
  {
    path: "/users/1",
    method: "GET",
    response: { id: 1, name: "Jane Doe" },
    delay: 400,
  },
  {
    path: "/auth/login",
    method: "POST",
    status: 401,
    response: { message: "Invalid credentials" },
    delay: 400,
  },
]);
```

Only activate this middleware in development environments using a conditional check on `process.env.NODE_ENV`.

---

## Error Handling

When a server returns a non-2xx response, the engine throws an `ApiError` instead of a generic `Error`. This gives you full visibility into what went wrong.

### ApiError Properties

| Property     | Type     | Description                                                          |
| :----------- | :------- | :------------------------------------------------------------------- |
| `status`     | `number` | HTTP status code (e.g., `404`, `500`).                               |
| `statusText` | `string` | HTTP status text (e.g., `"Not Found"`).                              |
| `data`       | `any`    | The full JSON body from the server's error response.                 |
| `message`    | `string` | Derived from `data.message` or `"API Error: {status} {statusText}"`. |

### Usage

```typescript
import { ApiError } from "@simple-api/core";

try {
  await api.users.get({ params: { id: "999" } });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`${error.status}: ${error.statusText}`);
    console.error("Server response:", error.data);

    if (error.status === 404) {
      // User doesn't exist — redirect to 404 page
    } else if (error.status === 401) {
      // Session expired — clear auth and redirect to login
    }
  } else {
    // True network failure (offline, DNS failure, etc.)
    console.error("Network error:", error.message);
  }
}
```

---

## Request Deduplication

The engine automatically deduplicates concurrent `GET` requests. If two parts of your application fire the same request at the same time, only one HTTP call is made. Both callers receive the same resolved value.

The deduplication key is derived from: `method + full URL (including query params) + serialized body`.

Once the request resolves — success or failure — the key is removed from the in-flight map, and subsequent calls will trigger a fresh network request.

This is entirely automatic and requires no configuration.

---

## Zustand Integration

The `@simple-api/zustand` package provides a middleware that pipes API responses directly into Zustand stores.

```typescript
import { createZustandMiddleware } from "@simple-api/zustand";
import { useUserStore } from "./stores";

const api = createApi({
  middleware: [
    createZustandMiddleware({
      stores: {
        user: (data) => useUserStore.getState().setUser(data),
      },
    }),
  ],
  ...
});

// The 'user' store is updated automatically after this call succeeds
await api.auth.login({
  body: { email, password },
  storeKey: "user",
});
```

---

## TypeScript

simple-api is written in TypeScript and designed for maximum type inference. The `ApiEngine<T>` mapped type ensures that your IDE provides accurate autocompletion and errors for every service, endpoint, and request option.

### ApiEngine

```typescript
type ApiEngine<T> = {
  [K in keyof T]: T[K] extends ServiceConfig
    ? {
        [E in keyof T[K]["endpoints"]]: (
          options?: RequestOptions,
        ) => Promise<any>;
      }
    : T[K] extends ServiceEndpoints
      ? { [E in keyof T[K]]: (options?: RequestOptions) => Promise<any> }
      : never;
};
```

The type system distinguishes between direct endpoint records and full service config objects (with middleware) without requiring any explicit type assertions from the consumer.

---

## Documentation

Full documentation is available at [simple-api/docs](https://simpleapidocs.vercel.app/)

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

---

## License

MIT License. See [LICENSE](./LICENSE) for full details.

Copyright (c) 2026 Elnatan Samuel
