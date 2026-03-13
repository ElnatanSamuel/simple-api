<p align="center">
  <img src="../../public/logo.png" width="200" alt="simple-api logo">
</p>

# @simple-api/core

**The high-performance, framework-agnostic engine powering simple-api.**

@simple-api/core is a production-grade API client builder designed for high-scale TypeScript applications. It provides a service-oriented architecture, built-in request deduplication, a powerful tiered middleware system, and automatic parameter injection.

---

## Core Features

- **Interceptors**: Global hooks for `onRequest`, `onResponse`, and `onError`.
- **PWA Caching**: Built-in Stale-While-Revalidate support via Web Cache API.
- **Polling**: Native background auto-refresh for any endpoint.
- **File Uploads**: Automatic conversion and header management for `multipart/form-data`.
- **Structured Errors**: Rich `ApiError` class with status codes and full response bodies.
- **Request Timeouts**: Built-in `AbortController` support.
- **Deduplication**: Automatic merging of concurrent identical `GET` requests.

---

## Installation

```bash
npm install @simple-api/core
```

---

## Quick Start

### 1. Define your API

```typescript
import { createApi } from "@simple-api/core";

export const api = createApi({
  baseUrl: "https://api.example.com",
  services: {
    users: {
      get: { method: "GET", path: "/users/:id" },
      update: { method: "PATCH", path: "/users/:id" },
    },
  },
});
```

### 2. Make Calls

```typescript
// Path parameters and types are automatically handled
const user = await api.users.get({ params: { id: "123" } });

// File uploads made easy
await api.users.update({
  params: { id: "123" },
  upload: true,
  body: { avatar: fileInput.files[0] },
});
```

---

## Technical Deep Dive

### Interceptors

Interceptors fire at specific execution points, regardless of your middleware stack.

```typescript
const api = createApi({
  interceptors: {
    onRequest: (ctx) => {
      console.log(`Starting ${ctx.service}.${ctx.endpoint}`);
      return ctx.options;
    },
    onResponse: (data) => data.payload ?? data,
  },
  ...
});
```

### PWA Caching (SWR)

```typescript
import { createCacheMiddleware } from "@simple-api/core";

const api = createApi({
  middleware: [createCacheMiddleware({ swr: true, ttl: 3600000 })],
  ...
});
```

### Native Polling

```typescript
// Re-fetch automatically every 5 seconds
api.users.list({ pollingInterval: 5000 });
```

### Middleware System

SimpleAPI uses a Koa-style `async (context, next)` middleware system.

1. **Global**: Runs on every request.
2. **Service**: Runs on every request to a specific service.
3. **Endpoint**: Runs only on a specific endpoint.

---

## Error Handling

When a request fails, the engine throws an `ApiError`.

```typescript
import { ApiError } from "@simple-api/core";

try {
  await api.users.get({ params: { id: "999" } });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.status, error.data);
  }
}
```

---

## License

MIT © Elnatan Samuel
