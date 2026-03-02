# @simple-api/core

**The high-performance, framework-agnostic engine powering simple-api.**

@simple-api/core is a production-grade API client builder designed for high-scale TypeScript applications. It provides a service-oriented architecture, built-in request deduplication, a powerful tiered middleware system, and automatic parameter injection.

## Project Philosophy

The core engine is built on three pillars:

1. **Type Safety**: End-to-end TypeScript inference without manual casting.
2. **Resilience**: Every network call can be wrapped in layers of protection (retries, timeouts, logging).
3. **Performance**: Native request deduplication and minimal overhead over the standard Fetch API.

## Installation

```bash
npm install @simple-api/core
# or
yarn add @simple-api/core
# or
pnpm add @simple-api/core
```

## Quick Start

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
// Types are inferred for 'id'
const user = await api.users.get({ params: { id: "123" } });

// Query parameters are serialized automatically
const activeUsers = await api.users.list({
  query: { status: "active", page: 1 },
});

// Request body is type-safe based on your endpoint definitions
await api.auth.login({ body: { email, password } });
```

## Middleware System

SimpleAPI uses a Koa-style middleware system. Middleware can intercept requests, modify options, and transform responses.

### Tiered Execution Logic

Middleware is executed in a specific order, from most broad to most specific:

1. **Global Middleware**: Defined in the root `createApi` config.
2. **Service Middleware**: Defined within a specific service object.
3. **Endpoint Middleware**: Defined on a specific endpoint.

The execution order is: **Global -> Service -> Endpoint**.

### Middleware Context

Every middleware receives a context object:

- `service`: The name of the service being called.
- `endpoint`: The name of the endpoint being called.
- `config`: The full configuration of the endpoint.
- `options`: The current request options (can be modified).

### Writing a Custom Middleware

```typescript
const myMiddleware = async ({ service, endpoint, options, config }, next) => {
  console.log(`Executing ${service}.${endpoint}`);

  // Modify headers
  options.headers = { ...options.headers, "X-Request-ID": "..." };

  // Call next to continue the pipeline
  const response = await next(options);

  // Modify response
  return { ...response, timestamp: Date.now() };
};
```

## Structured Error Handling (ApiError)

When a request fails (non-2xx response), the engine throws an `ApiError`. This class provides all the information needed to handle failures gracefully.

```typescript
import { ApiError } from "@simple-api/core";

try {
  await api.users.get({ params: { id: "not-found" } });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Status: ${error.status} ${error.statusText}`);
    console.error("Payload:", error.data); // The actual JSON response from the server
  }
}
```

## Core Engine Mechanics

### Request Deduplication

To optimize performance, all `GET` requests are automatically deduplicated. If your application triggers the same request (identical method, URL, and body) while one is already in flight, the engine will return the existing promise instead of making a second network call.

### Parameter Injection

Path parameters (e.g., `:id`) are resolved at runtime. If an endpoint defines a path parameter that is not provided in the `params` object, the engine will throw an error to prevent malformed requests from reaching your server.

### URL Building

The engine uses the native `URL` API and `searchParams` for serialization, ensuring that your queries are always correctly encoded.

## License

MIT © Elnatan Samuel
