# 🚀 simple-api Engine

**The ultimate framework-agnostic API engine for high-scale TypeScript applications.**

simple-api is a production-grade, type-safe API client builder. It abstracts away the boilerplate of `fetch`, providing a service-oriented architecture with built-in resilience, performance, and multi-framework support.

---

## 📦 Packages

| Package                                              | Status | Description                                 |
| :--------------------------------------------------- | :----- | :------------------------------------------ |
| [`@simple-api/core`](/packages/core)                 | ✅     | Pure TS Engine + Deduplication + Middleware |
| [`@simple-api/react`](/packages/react)               | ✅     | TanStack Query Adapter for React            |
| [`@simple-api/svelte`](/packages/svelte)             | ✅     | TanStack Query Adapter for Svelte           |
| [`@simple-api/zustand`](/packages/zustand)           | ✅     | Zustand Synchronization Middleware          |
| [`@simple-api/react-native`](/packages/react-native) | ✅     | Mobile-optimized Adapter                    |

---

## ✨ Core Features

### 🧩 Framework Agnostic

The core engine runs anywhere—Node.js, Browser, React Native, or even a CLI. It has **zero dependencies**.

### 🏗️ Service-Based Architecture

Organize 100+ endpoints into logical services (e.g., `api.users`, `api.auth`) without spaghetti code.

### ⚡ Automatic DX

- **Path Parameters**: `/users/:id` -> `/users/123` automatically.
- **Query Serialization**: Complex objects to query strings.
- **Deep Typing**: Full TypeScript inference from definition to hook.

### 🔄 Built-in Resilience (Middleware)

- **Auto-Retry**: Exponential backoff for flaky networks.
- **Request Deduplication**: Concurrent identical GET requests are merged into one.
- **Transformers**: Automatic `camelCase` (JS) to `snake_case` (API) conversion.
- **Logger**: Beautifully grouped console logs for debugging.

---

## 🚀 Quick Start

### 1. Define your API

```typescript
import {
  createApi,
  createTransformerMiddleware,
  createRetryMiddleware,
} from "@simple-api/core";

export const api = createApi({
  baseUrl: "https://api.example.com",
  middleware: [
    createTransformerMiddleware(),
    createRetryMiddleware({ maxRetries: 3 }),
  ],
  services: {
    auth: {
      login: { method: "POST", path: "/auth/login" },
    },
    users: {
      get: { method: "GET", path: "/users/:id" },
    },
  },
});
```

### 2. Connect to React (via TanStack)

```tsx
import { createReactAdapter } from "@simple-api/react";

const useApi = createReactAdapter(api);

export const Profile = ({ id }) => {
  const { users } = useApi();
  // Automatic Query Key: ['users', 'get', { id }]
  const { data, isLoading } = users().get({ params: { id } });

  if (isLoading) return <p>Loading...</p>;
  return <h1>{data.userName}</h1>;
};
```

### 3. Sync with Zustand

```typescript
import { createZustandMiddleware } from "@simple-api/zustand";
import { useAuthStore } from "./store";

// Pipe login response directly into your store
await api.auth.login({
  body: { email, password },
  storeKey: "auth", // Matches the key in middleware config
});
```

---

## 🎭 Mocking & Development

Develop before the backend is even ready.

```typescript
const mockMiddleware = createMockMiddleware([
  { path: "/users/1", response: { id: 1, name: "John Doe" }, delay: 500 },
]);
```

---

## 🛠 Advanced Usage

### Optimistic UI

The React adapter exposes `variables`, `isPending`, and `reset` directly, making it trivial to build snappy interfaces.

### Mutation Invalidation

```typescript
const { execute } = useApi()
  .users()
  .update({
    invalidates: ["users"], // Automatically clears user list cache on success
  });
```

---

## 📄 License

MIT © Elnatan Samuel
